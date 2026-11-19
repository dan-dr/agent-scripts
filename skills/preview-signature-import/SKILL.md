---
name: preview-signature-import
description: Import a handwritten signature or initials PNG into macOS Preview's saved signature library through Keychain Access, including when SIP is enabled. Use for PNG-to-Preview import or replacing a saved signature, not certificate-based PDF signing.
---

# Preview Signature Import

Convert a clean signature PNG to native Preview data, then replace the user-designated placeholder through Keychain Access. This succeeded on macOS 26.6.2 with SIP enabled. Private AnnotationKit interfaces may change across releases; verify compatibility on the current Mac.

## Prepare

- Use the user's approved signature or initials image. Prefer black ink on transparency, cropped to the ink with small padding. Labels, rules, scan artifacts, and unrelated marks become contours too. Inspect first; use the available image-editing workflow if cleanup is requested.
- Preserve the handwriting. White phone-display versions are separate deliverables: use a portrait canvas matching the screen, centered ink, and generous margins. They are not the import source.
- Have Preview create one disposable entry per signature with distinct descriptions. Identify existing entries if the user already created them. Trackpad may be unavailable; Camera or iPhone can create placeholders. Ask only for physical drawing or device actions automation cannot perform.
- Replace only user-designated entries. Backups are optional; respect a request to skip them. Importing into the library does not authorize signing a document.

## Import

Read [the Keychain workflow](references/keychain-workflow.md) before changing an entry. It covers identity matching, encoding, clipboard transfer, refresh, and observed failures.

1. Locate the placeholder in Keychain Access and record its Account UUID. Do not infer identity solely from row order.
2. Generate matching import data:

   ```text
   python3 <skill>/scripts/prepare_signature.py --image <clean.png> --account <placeholder-UUID> --label <description> --out-dir <new-work-directory>
   ```

   Requires macOS, Xcode Command Line Tools or Xcode, and Python 3. Builds a local helper, traces ink using Vision, and securely archives an AKSignature. Never reads or writes Keychain. See `--help` for outputs.
3. Inspect `signature-preview.png`: correct orientation, complete strokes, no unwanted contours.
4. Replace only that entry's data through Keychain Access and save. Preserve Account and access settings.
5. Open Preview's signature menu and visually confirm the handwriting. Verify each requested entry independently. Stop once visibly correct; do not insert it into an open contract as a test.

If interfaces are missing, rendering is wrong, or saving fails, stop that mutation and report the specific failure. Do not repeatedly modify other entries or disable security protections to make this technique work.
