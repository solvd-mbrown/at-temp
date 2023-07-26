import React from 'react';
import {Icon} from 'native-base';
import {Path, G, Defs, ClipPath} from 'react-native-svg';

const ZoomInIcon = () => {
	return (
		<Icon size="48px" viewBox="0 0 48 48">
			<G clip-path="url(#a)" fill="#fff">
				<Path d="M22.003 6.91v-.046c0-.01-.01-.029-.01-.038 0-.01 0-.019-.008-.028 0-.019-.01-.038-.01-.056 0-.02-.01-.028-.01-.047 0-.01-.009-.028-.009-.038a.997.997 0 0 0-.318-.45L16.64 2.204a1 1 0 1 0-1.247 1.566l3.15 2.522L4.876 7.998a1.008 1.008 0 0 0-.872 1.115 1 1 0 0 0 .993.872c.047 0 .085 0 .132-.01l13.959-1.733-1.95 3.234a1.007 1.007 0 0 0 .347 1.378c.159.094.337.14.515.14.338 0 .666-.178.863-.487l2.98-4.968a.96.96 0 0 0 .16-.629ZM43.996 3.873A.99.99 0 0 0 42.89 3L27.91 4.763l1.95-3.253a.994.994 0 0 0-.348-1.368 1.002 1.002 0 0 0-1.368.337l-3 4.997a.997.997 0 0 0-.028.984v.01c.01.028.028.047.037.075v.01c.019.018.028.046.047.065v.01c.019.018.038.046.056.065l.02.018 4.002 4.003c.197.197.45.291.713.291a.992.992 0 0 0 .712-.29.996.996 0 0 0 0-1.416l-2.531-2.56L43.125 4.98a.988.988 0 0 0 .871-1.106Z" />
				<Path d="M40.19 32.213a3.76 3.76 0 0 0-1.65-.994 3.835 3.835 0 0 0-.356-5.025 3.757 3.757 0 0 0-1.65-.975 3.835 3.835 0 0 0-.356-5.025 3.814 3.814 0 0 0-1.613-.965l3.544-3.544a3.822 3.822 0 0 0-.01-5.41 3.82 3.82 0 0 0-5.4 0L19.087 23.899l-1.265-8.072a4.478 4.478 0 0 0-4.416-3.835c-1.65 0-3 1.35-3 3v18.862c0 2.944 1.144 5.7 3.225 7.782l3.14 3.15A10.928 10.928 0 0 0 24.544 48a10.96 10.96 0 0 0 7.397-2.86l8.26-7.518a3.822 3.822 0 0 0-.01-5.41Zm-1.369 3.956-8.23 7.49a8.962 8.962 0 0 1-6.048 2.335c-2.4 0-4.659-.938-6.356-2.635l-3.14-3.15a8.941 8.941 0 0 1-2.635-6.365V14.991c0-.553.45-1.003 1.004-1.003 1.218 0 2.259.91 2.437 2.128l1.575 10.031a1 1 0 0 0 .675.797c.356.122.75.019 1.022-.243l15.009-15.01a1.825 1.825 0 0 1 2.587.01 1.822 1.822 0 0 1 0 2.578L26.7 24.282a.996.996 0 0 0 0 1.415.996.996 0 0 0 1.415 0l4.088-4.087c.684-.684 1.875-.694 2.587.01a1.822 1.822 0 0 1 0 2.577l-3.581 3.572-.506.507a.996.996 0 0 0 0 1.415.996.996 0 0 0 1.415 0l.506-.506L34.2 27.61c.685-.684 1.875-.694 2.588.01a1.822 1.822 0 0 1 0 2.577l-1.584 1.575-.497.497-.01.01a.996.996 0 0 0 0 1.415.996.996 0 0 0 1.416 0l.084-.084c.694-.685 1.875-.694 2.588.01.712.712.712 1.865.037 2.549Z" />
			</G>
			<Defs>
				<ClipPath id="a">
					<Path fill="#fff" d="M0 0h48v48H0z" />
				</ClipPath>
			</Defs>
		</Icon>
	);
};

export default ZoomInIcon;
