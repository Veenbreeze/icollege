import { Platform } from 'react-native';
// The flat cacheDirectory/copyAsync API only lives under /legacy now — the
// default export replaced it with the File/Directory classes below.
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { File } from 'expo-file-system';

/**
 * Appends a picked media asset (from expo-image-picker) to a FormData
 * instance in whichever shape the current runtime actually accepts.
 *
 * - Web: FormData only accepts real Blob/File objects, so the asset's
 *   blob:/data: uri is fetched into an actual Blob.
 * - Native: React Native's classic `{uri,name,type}` tuple is no longer
 *   accepted here — Expo's runtime FormData now validates parts as either a
 *   string or a spec-compliant Blob and throws "Unsupported FormData part
 *   implementation" otherwise. `expo-file-system`'s `File` class implements
 *   Blob and is the sanctioned replacement. It's built from a plain file://
 *   uri, so content://ph:// picker uris are copied into the app's cache
 *   directory first.
 */
export async function appendFilePart(form, fieldName, asset, { fallbackName = 'file', fallbackType = 'application/octet-stream' } = {}) {
  const name = asset.fileName ?? asset.name ?? fallbackName;

  if (Platform.OS === 'web') {
    const blob = await (await fetch(asset.uri)).blob();
    form.append(fieldName, blob, name);
    return;
  }

  let uri = asset.uri;
  if (!uri.startsWith('file://')) {
    const dest = `${LegacyFileSystem.cacheDirectory}${Date.now()}-${name}`;
    await LegacyFileSystem.copyAsync({ from: uri, to: dest });
    uri = dest;
  }
  form.append(fieldName, new File(uri), name);
}
