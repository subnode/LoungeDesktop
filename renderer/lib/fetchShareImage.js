import {fetchProtocolPrefix} from '../../common/config';


/**
 * @param {string} imageUrl
 * @returns {Promise<string>}
 */
export default async function fetchShareImage(imageUrl) {
  if (typeof imageUrl !== 'string' || !/^https?:\/\//.test(imageUrl)) {
    throw new Error('invalid imageUri specified');
  }

  const response = await fetch(fetchProtocolPrefix + imageUrl);
  if (!response.ok) {
    throw new Error('fetch failed');
  }

  const responseClone = response.clone();

  const blob = await response.blob();

  return [
    URL.createObjectURL(blob),
    responseClone,
  ];
}
