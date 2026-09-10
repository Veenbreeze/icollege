import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Appends a picked media asset (from expo-image-picker) to a FormData
 * instance in whichever shape the current platform actually accepts.
 *
 * - Web: FormData only accepts real Blob/File objects, not a {uri,name,type}
 *   object, so the asset's blob:/data: uri is fetched into an actual Blob.
 * - Native: a {uri,name,type} object is the right shape, but Android's
 *   networking layer rejects `content://`/`ph://` uris with "Unsupported
 *   FormData part implementation" — copying the asset into the app's cache
 *   directory first gives a plain file:// uri, which always works.
 */
export async function appendFilePart(form, fieldName, asset, { fallbackName = 'file', fallbackType = 'application/octet-stream' } = {}) {
  const name = asset.fileName ?? asset.name ?? fallbackName;
  const type = asset.mimeType ?? fallbackType;

  if (Platform.OS === 'web') {
    const blob = await (await fetch(asset.uri)).blob();
    form.append(fieldName, blob, name);
    return;
  }

  let uri = asset.uri;
  if (!uri.startsWith('file://')) {
    const dest = `${FileSystem.cacheDirectory}${Date.now()}-${name}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    uri = dest;
  }
  form.append(fieldName, { uri, name, type });
}
