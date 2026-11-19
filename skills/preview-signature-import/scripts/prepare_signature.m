#import <AppKit/AppKit.h>
#import <Vision/Vision.h>
#import <objc/message.h>
#import <dlfcn.h>

static BOOL prepare(NSString *input, NSUUID *account, NSString *label, NSString *output) {
    if (!dlopen("/System/Library/PrivateFrameworks/AnnotationKit.framework/AnnotationKit", RTLD_LAZY)) {
        NSLog(@"AnnotationKit could not be loaded; do not import.");
        return NO;
    }
    Class signatureClass = NSClassFromString(@"AKSignature");
    SEL initializer = NSSelectorFromString(@"initWithDrawing:path:baselineOffset:creationDate:descriptionTag:customDescription:");
    SEL setID = NSSelectorFromString(@"setUniqueID:");
    SEL setPersist = NSSelectorFromString(@"setShouldPersist:");
    if (!signatureClass || ![signatureClass instancesRespondToSelector:initializer] ||
        ![signatureClass instancesRespondToSelector:setID] ||
        ![signatureClass instancesRespondToSelector:setPersist]) {
        NSLog(@"Unsupported AnnotationKit signature interfaces; do not import.");
        return NO;
    }
    NSImage *image = [[NSImage alloc] initWithContentsOfFile:input];
    CGImageRef source = [image CGImageForProposedRect:NULL context:nil hints:nil];
    if (!source) { NSLog(@"Input image could not be decoded."); return NO; }
    size_t width = CGImageGetWidth(source), height = CGImageGetHeight(source);
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    CGContextRef context = CGBitmapContextCreate(NULL, width, height, 8, width * 4,
                                               colorSpace, kCGImageAlphaPremultipliedLast);
    CGColorSpaceRelease(colorSpace);
    if (!context) { NSLog(@"Could not allocate image context."); return NO; }
    CGContextSetRGBFillColor(context, 1, 1, 1, 1);
    CGContextFillRect(context, CGRectMake(0, 0, width, height));
    CGContextDrawImage(context, CGRectMake(0, 0, width, height), source);
    CGImageRef opaque = CGBitmapContextCreateImage(context);
    CGContextRelease(context);
    if (!opaque) return NO;
    VNDetectContoursRequest *request = [VNDetectContoursRequest new];
    request.usesCPUOnly = YES;
    request.detectsDarkOnLight = YES;
    request.contrastAdjustment = 1;
    request.maximumImageDimension = 4096;
    VNImageRequestHandler *handler = [[VNImageRequestHandler alloc] initWithCGImage:opaque options:@{}];
    NSError *error = nil;
    BOOL detected = [handler performRequests:@[request] error:&error];
    CGImageRelease(opaque);
    if (!detected || !request.results.count) {
        NSLog(@"Contour detection failed: %@", error);
        return NO;
    }
    VNContoursObservation *observation = request.results.firstObject;
    CGAffineTransform pixels = CGAffineTransformMakeScale(width, height);
    CGPathRef pixelPath = CGPathCreateCopyByTransformingPath(observation.normalizedPath, &pixels);
    CGRect bounds = CGPathGetPathBoundingBox(pixelPath);
    if (CGRectIsEmpty(bounds) || CGRectIsInfinite(bounds) || CGRectIsNull(bounds)) {
        CGPathRelease(pixelPath);
        NSLog(@"No usable ink contours found.");
        return NO;
    }
    double scale = MIN(300.0 / bounds.size.width, 130.0 / bounds.size.height);
    CGAffineTransform normalization = CGAffineTransformMake(scale, 0, 0, scale,
        -bounds.origin.x * scale, -bounds.origin.y * scale);
    CGPathRef path = CGPathCreateCopyByTransformingPath(pixelPath, &normalization);
    CGPathRelease(pixelPath);
    id signature = ((id(*)(id, SEL, id, CGPathRef, double, id, NSInteger, id))objc_msgSend)(
        [signatureClass alloc], initializer, nil, path, 0.0, [NSDate date], -1, label);
    if (!signature) { CGPathRelease(path); return NO; }
    ((void(*)(id, SEL, id))objc_msgSend)(signature, setID, account);
    ((void(*)(id, SEL, BOOL))objc_msgSend)(signature, setPersist, YES);
    NSData *archive = [NSKeyedArchiver archivedDataWithRootObject:signature requiringSecureCoding:YES error:&error];
    if (!archive) {
        CGPathRelease(path);
        NSLog(@"Signature archiving failed: %@", error);
        return NO;
    }
    id decoded = [NSKeyedUnarchiver unarchivedObjectOfClass:signatureClass fromData:archive error:&error];
    if (!decoded) {
        CGPathRelease(path);
        NSLog(@"Signature archive cannot be read back: %@", error);
        return NO;
    }
    NSSize size = NSMakeSize(bounds.size.width * scale + 40, bounds.size.height * scale + 40);
    NSImage *preview = [[NSImage alloc] initWithSize:size];
    [preview lockFocus];
    [[NSColor whiteColor] setFill];
    NSRectFill(NSMakeRect(0, 0, size.width, size.height));
    CGContextRef drawing = NSGraphicsContext.currentContext.CGContext;
    CGContextTranslateCTM(drawing, 20, 20);
    CGContextAddPath(drawing, path);
    CGContextSetRGBFillColor(drawing, 0, 0, 0, 1);
    CGContextEOFillPath(drawing);
    [preview unlockFocus];
    CGPathRelease(path);
    NSBitmapImageRep *bitmap = [NSBitmapImageRep imageRepWithData:preview.TIFFRepresentation];
    NSData *png = [bitmap representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
    NSData *encoded = [[archive base64EncodedStringWithOptions:0] dataUsingEncoding:NSASCIIStringEncoding];
    if (!png || !encoded) { NSLog(@"Could not render or encode signature."); return NO; }
    NSDictionary<NSString *, NSData *> *files = @{
        @"signature.archive": archive,
        @"signature-data.txt": encoded,
        @"signature-preview.png": png
    };
    for (NSString *name in files) {
        if (![files[name] writeToFile:[output stringByAppendingPathComponent:name]
                             options:NSDataWritingAtomic error:&error]) {
            NSLog(@"Writing %@ failed: %@", name, error);
            return NO;
        }
    }
    NSLog(@"Prepared %lu contours, %.1f x %.1f path. Keychain untouched.",
        (unsigned long)observation.contourCount, size.width - 40, size.height - 40);
    return YES;
}

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 5) { fprintf(stderr, "Expected image, UUID, label, output directory.\n"); return 2; }
        NSUUID *account = [[NSUUID alloc] initWithUUIDString:@(argv[2])];
        if (!account) return 2;
        @try {
            return prepare(@(argv[1]), account, @(argv[3]), @(argv[4])) ? 0 : 1;
        } @catch (NSException *exception) {
            NSLog(@"Unsupported native signature operation: %@", exception.reason);
            return 1;
        }
    }
}
