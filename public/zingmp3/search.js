const axios = require("axios");

exports.name = '/zingmp3/search';
exports.index = async (req, res, next) => {
		try {
				const keyWord = req.query.keyword;
				if (!keyWord) {
						return res.status(400).json({ 
								error: 'DÙNG "http://ac.mp3.zing.vn/complete?type=artist,song,key,code&num=500&query=" ĐI',
								status: 'error'
						});
				}

				// Manually encode Vietnamese characters to match Zing's API
				const vietnameseEncoded = keyWord
						.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
						.replace(/[èéẹẻẽêềếệểễ]/g, 'e')
						.replace(/[ìíịỉĩ]/g, 'i')
						.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
						.replace(/[ùúụủũưừứựửữ]/g, 'u')
						.replace(/[ỳýỵỷỹ]/g, 'y')
						.replace(/[đ]/g, 'd')
						.replace(/\s+/g, '%20');

				const fullUrl = `http://ac.mp3.zing.vn/complete?type=artist,song,key,code&num=500&query=${vietnameseEncoded}`;

				const response = await axios.get(fullUrl, {
						headers: {
								'User-Agent': 'Mozilla/5.0'
						}
				});

				return res.json(response.data);
		} catch (error) {
				console.error('Search API Error:', error);
				return res.status(500).json({
						error: 'Lỗi trong quá trình tìm kiếm',
						status: 'error'
				});
		}
};