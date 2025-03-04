const axios = require("axios");
const https = require('https');

exports.name = '/zingmp3/download';
exports.index = async (req, res, next) => {
		const link = req.query.link;
		if (!link)
				return res.status(400).json({ error: 'Thiếu dữ liệu để khởi chạy chương trình' });

		const id = link.match(/\/([a-zA-Z0-9]+)\.html/)?.[1] || link.match(/([a-zA-Z0-9]+)$/)?.[1];

		if (!id) 
				return res.status(400).json({ error: 'Không thể trích xuất ID bài hát' });

		try {
				// Tạo một instance axios với timeout và cấu hình bổ sung
				const apiClient = axios.create({
						baseURL: 'http://ac.mp3.zing.vn/api/streaming/audio/',
						timeout: 10000, // 10 giây timeout
						httpsAgent: new https.Agent({ rejectUnauthorized: false }),
						responseType: 'stream',
						validateStatus: function (status) {
								return status >= 200 && status < 300; // Chấp nhận các mã trạng thái 2xx
						}
				});

				const response = await apiClient.get(`${id}/128`);

				// Kiểm tra kích thước stream
				if (!response.data || response.data.readableLength === 0)
						throw new Error('Stream trống');

				// Tạo tên file từ ID nếu có thể
				const filename = `${id || 'zingmp3'}.mp3`;

				res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
				res.set('Content-Type', 'audio/mpeg');
				response.data.pipe(res);
		}
		catch (error) {
				console.error('Lỗi tải xuống:', error.message);
				res.status(500).json({ 
						error: 'Không thể tải xuống bài hát',
						details: error.message 
				});
		}
};