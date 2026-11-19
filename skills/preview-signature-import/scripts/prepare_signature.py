#!/usr/bin/env python3
"""Prepare a Preview drawing archive and base64 data; never access Keychain."""

import argparse
import base64
import json
import os
from pathlib import Path
import plistlib
import subprocess
import sys
import uuid


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--image', required=True, type=Path, help='Clean dark-ink PNG, transparent or white background')
    parser.add_argument('--account', required=True, help='Account UUID of the Preview-created placeholder')
    parser.add_argument('--label', required=True, help='Description shown in Preview')
    parser.add_argument('--out-dir', required=True, type=Path, help='New directory for signature-data.txt, signature.archive, signature-preview.png, and build files')
    args = parser.parse_args()
    if sys.platform != 'darwin':
        parser.error('This helper requires macOS.')
    try:
        account = str(uuid.UUID(args.account)).upper()
    except ValueError:
        parser.error('--account must be a valid UUID.')
    image = args.image.expanduser().resolve()
    if not image.is_file():
        parser.error('--image must be an existing file.')
    if not args.label.strip():
        parser.error('--label must not be blank.')
    out_dir = args.out_dir.expanduser().resolve()
    try:
        out_dir.mkdir(mode=0o700, parents=True, exist_ok=False)
    except FileExistsError:
        parser.error('--out-dir already exists; choose a new work directory.')
    source = Path(__file__).resolve().with_name('prepare_signature.m')
    binary = out_dir / 'prepare-signature'
    subprocess.run([
        'xcrun', 'clang', '-fobjc-arc',
        '-fmodules-cache-path=' + str(out_dir / 'module-cache'),
        '-framework', 'AppKit', '-framework', 'Vision',
        str(source), '-o', str(binary),
    ], check=True)
    subprocess.run([str(binary), str(image), account, args.label, str(out_dir)], check=True)
    data_path = out_dir / 'signature-data.txt'
    archive_path = out_dir / 'signature.archive'
    encoded = data_path.read_bytes()
    archive = base64.b64decode(encoded, validate=True)
    if archive != archive_path.read_bytes():
        raise RuntimeError('Encoded data does not match native archive.')
    plist = plistlib.loads(archive)
    objects = plist['$objects']
    root = objects[plist['$top']['root'].data]
    archived_id = objects[root['uniqueID'].data]
    if uuid.UUID(bytes=archived_id['NS.uuidbytes']) != uuid.UUID(account):
        raise RuntimeError('Archive UUID does not match placeholder Account.')
    if objects[root['customDescription'].data] != args.label:
        raise RuntimeError('Archive description does not match requested label.')
    if root['descriptionTag'] != -1 or root['shouldPersist'] is not True:
        raise RuntimeError('Unexpected signature metadata; do not import.')
    for path in (data_path, archive_path, out_dir / 'signature-preview.png'):
        os.chmod(path, 0o600)
    print(json.dumps({
        'account': account, 'label': args.label,
        'base64_characters': len(encoded),
        'data_file': str(data_path),
        'preview_file': str(out_dir / 'signature-preview.png'),
        'keychain_accessed': False,
    }, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f'Preparation failed: {error}', file=sys.stderr)
        sys.exit(1)
