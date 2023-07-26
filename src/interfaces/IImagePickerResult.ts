import {Image} from 'react-native-image-crop-picker';

export interface IImagePickerResult extends Image {
	cancelled?: boolean;
}
