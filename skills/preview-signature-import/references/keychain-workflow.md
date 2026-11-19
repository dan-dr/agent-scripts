# Keychain replacement workflow

## Identify the entry

On the observed macOS 26.6.2 installation, signatures were synchronizable generic-password items in iCloud Keychain:

| Attribute | Observed value |
|---|---|
| Name / label | `Signature Annotation Privacy` |
| Where / service | `Signature Annotation Privacy Service` |
| Account | UUID matching archived `uniqueID` |
| Access group | `com.apple.AnnotationKit` |

These are drawing archives stored in a password field, not authentication credentials. Do not change unrelated credentials or access controls.

Search Keychain Access for the label, select the relevant keychain, and open the candidate item. Distinguish placeholders by creation/modification time and archived `customDescription`, correlated with Preview's menu. If still ambiguous, obtain the specific intended entry before replacing it. Do not dump the whole Keychain or expose payloads in chat.

Show password reveals ASCII base64 of an NSKeyedArchiver binary plist, not a PNG or hexadecimal string. Local decoding can establish description and UUID. The helper produces this representation directly with the placeholder Account UUID and requested description. The observed archive stored `descriptionTag = -1`, `shouldPersist = true`, a CGPath, creation date, and UUID object.

## Transfer and save

Use the available computer-use tool for native UI actions. Read its current documentation and refresh state after actions; indices are transient.

1. Open generated `signature-data.txt` in TextEdit as plain text. Focus document, Select All, Copy.
2. Return to the correct Keychain detail window. Confirm Account UUID, enable Show password, select the entire data field, paste replacement. Keep other fields unchanged.
3. Confirm pasted character count matches the helper's printed base64 length. Examples were about 299 KB for a full signature and 162 KB for initials; size is image-dependent. Where available, compare exact field contents locally without emitting them.
4. Save Changes. Observe success and updated modification time. A populated field alone is not proof of saving.
5. Repeat with the other entry's own UUID and payload if requested.

With CUA, large AX values can overwhelm output. Fetch state with `emit:false`, then emit only window names, labels, UUIDs, lengths, and redacted prefixes. State may be a diff; request a full tree when parsing an unchanged payload. Native TextEdit Copy followed by native Keychain Paste reliably transferred large files. App-level `paste` may restore the prior clipboard, so avoid it between Copy and native Paste. `setValue` worked for file-dialog paths. A transient zero-sized-screen error after Open did not mean opening failed; inspect current state before repeating the click.

## Verify in Preview

Close and reopen the signature popup first. Updated entries appeared without restarting Preview in the successful run. Dark mode displayed white thumbnails even though paths render as black ink on a document.

For stale drawings, use an isolated scratch document and reopen the menu, or restart Preview only after accounting for user-owned unsaved documents. Never discard or save unrelated work implicitly. Do not click a signature row in a contract to test import: that inserts a signature. Menu thumbnails verify library import.

## Observed failures

- A standalone helper calling SecItemAdd for `com.apple.AnnotationKit` returned `-34018` (`errSecMissingEntitlement`) with SIP enabled. This means the caller lacked the group entitlement, not that GUI replacement is impossible or SIP must be disabled.
- Keychain Access successfully edited Preview-created entries with SIP enabled. Use that route instead of re-signing Apple apps, changing bundle IDs, modifying protected databases, or injecting code into Preview.
- Copying a selected item into another keychain returned "One or more parameters ... invalid." This was not an import method.
- Legacy OS X 10.9 plist-injection instructions do not describe this modern format.
- Vision failed inside constrained execution with `VNContourDetector: Failed to create image filters`, then succeeded with normal required execution permissions. Address this through the host permission mechanism without changing SIP or TCC.

## Provenance and limits

Observed end to end on 17 November 2026, macOS 26.6.2: two placeholders replaced, handwriting visible in Preview's menu. Compatibility on other releases is unverified. Bundled code checks private class/selectors and performs no Keychain operations. No personal signature assets or fixed Account UUIDs are bundled.

Background sources for rechecking format or failures:

- [Historical investigation](https://michaellynn.github.io/2015/07/26/exploring-os-x-preview-signatures/)
- [First-hand modern Keychain import workflow](https://expatinromania.substack.com/p/importing-signatures-in-apples-preview)
- [Apple's missing-entitlement error](https://developer.apple.com/documentation/security/errsecmissingentitlement)
