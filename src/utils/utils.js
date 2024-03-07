import DOMPurify from 'dompurify';

export const createMarkup = (html) => {
	return {
		__html: DOMPurify.sanitize(html)
	}
}