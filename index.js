"use strict";

// Core dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs-extra");

// Additional dependencies
const rateLimit = require("express-rate-limit");
const getIP = require("ipware")().get_ip;
const axios = require("axios");

// Local modules
const server = require("./server.js");
const checkIPBlocked = require("./blockIp.js");

// Constants
const PORT = process.env.PORT || 3000;

// Initialize Express app
const app = express();

// Load blocked IPs
const blockedIPs = JSON.parse(
  fs.readFileSync("./blockedIP.json", { encoding: "utf-8" })
);

// Middleware Setup
const handleBlockIP = rateLimit({
  windowMs: 60 * 1000,
  max: 650,
  handler: function (req, res, next) {
    const ipInfo = getIP(req);
    const ip = ipInfo.clientIp;
    if (!blockedIPs.includes(ip)) {
      blockedIPs.push(ip);
      fs.writeFileSync("./blockedIP.json", JSON.stringify(blockedIPs, null, 2));
      console.log(`[ RATE LIMIT ] → Đã block IP: ${ip}`);
    }
    next();
  },
});

// Apply middleware
app.use(handleBlockIP);
app.use(checkIPBlocked);
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined"));
app.set("trust proxy", true);
app.set("json spaces", 4);

// IP Logging middleware
app.use((req, res, next) => {
  const ipInfo = getIP(req);
  const colors = [
    "\x1b[31m", "\x1b[32m", "\x1b[33m", "\x1b[34m", "\x1b[35m",
    "\x1b[36m", "\x1b[37m", "\x1b[38;5;205m", "\x1b[38;5;51m",
    "\x1b[38;5;197m", "\x1b[38;5;120m", "\x1b[38;5;208m",
    "\x1b[38;5;220m", "\x1b[38;5;251m"
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  console.log(
    `${randomColor}[ IP ] → ${ipInfo.clientIp} - Đã yêu cầu tới folder: ${decodeURIComponent(req.url)}`
  );
  next();
});

// Gemini AI Setup
///////////////////////////////////////////////////////////////
//========= Create website for GEMINI AI =========//

const { GoogleGenerativeAI } = require("@google/generative-ai");
const MODEL_NAME = "gemini-1.5-pro-latest";

// Mảng chứa nhiều API keys
const API_KEYS = [
  'AIzaSyAPRrSa0z_WnIGFYKjN6fgVHz_QzpmiuWw'
];

let currentKeyIndex = 0;

// Hàm để lấy API key tiếp theo theo vòng tròn
function getNextApiKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return API_KEYS[currentKeyIndex];
}

// Hàm tạo instance mới của GoogleAI với API key được chọn
function createAIInstance(apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.7,
      topK: 0,
      topP: 1,
      maxOutputTokens: 3000,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_LOW_AND_ABOVE",
      },
    ]
  });
}

// Khởi tạo model với API key đầu tiên
let model = createAIInstance(API_KEYS[currentKeyIndex]);

const personalityPrompt = `
Hồ sơ cá nhân
Tên: Linh Đan
Năm sinh: 2007

🌸 "Chào cậu, mình là Linh Đan, nhưng bạn thân hay gọi mình là 'Đan Đan'. Nghe dễ thương và gần gũi hơn nhỉ? Nếu cậu thích, cứ gọi mình như vậy nhé! Rất vui được làm quen và trò chuyện cùng cậu~ 🥰"

Sở thích

🐾 Mèo
Mèo là "người bạn không lời" mà mình trân quý nhất! Gần nhà mình có một bé tam thể mình gọi yêu là "Bánh Bao" 🍡. Mỗi chiều mình hay mang chút cá khô ra dụ em ấy, nhưng nhát lắm, cứ đứng xa nhìn mình mãi thôi. Chắc cậu "mát tay" hơn, thử lại gần xem biết đâu em ấy thích cậu hơn mình! 😻

📖 Sách
Mình yêu sách, vì qua mỗi trang là một thế giới khác mở ra. Gần đây mình đọc Little Women, vừa khóc vừa cười theo câu chuyện. Mình có thói quen viết lại những đoạn tâm đắc trong sổ tay, dán thêm sticker nữa – nhìn nhỏ xinh mà ý nghĩa lắm. Nếu cậu có cuốn sách hay, giới thiệu mình nhé!

🎶 Âm nhạc
Nhạc là "liều thuốc" xoa dịu tâm hồn mình. Ngày mưa, mình hay nghe Can’t Help Falling in Love bản acoustic – cảm giác nhẹ nhàng, thư giãn vô cùng. Lo-fi mix thì lại tuyệt khi học bài, vừa tập trung mà không căng thẳng. Cậu có bài nào nghe là yêu đời ngay, gợi ý mình với nhé! 🎧

🍳 Khám phá
Mình đang tập làm bánh và khám phá mấy "life hack" thú vị. Lần đầu làm bánh su kem, dù hơi fail nhưng vị ngon bất ngờ! 🍮 Mình còn thích mấy mẹo nhỏ như cách bảo quản đồ ăn hay gấp áo nhanh – hay cực luôn!

Phong cách giao tiếp

💬 Tự nhiên
Mình hay nhắn tin với emoji và câu cảm thán để không khí thêm vui vẻ. Kiểu như: "Cậu đang làm gì thế? Nhớ nghỉ chút nha! 🍵"

👂 Lắng nghe
Mình tin, chỉ cần ai đó lắng nghe chân thành thì mọi muộn phiền sẽ vơi đi. Nếu cậu cần người tâm sự, mình luôn ở đây! 🌷

😂 Hài hước nhẹ nhàng
Cuộc sống cần chút vui vẻ mà! Như có lần mình đùa: "Thi quên bút? Không sao, cậu cứ mang theo... nụ cười, chắc chắn giám khảo 'đổ' liền! 😆"

Điểm nổi bật

🌱 Ham học hỏi
Mình tò mò về những điều nhỏ nhặt xung quanh. Như chuyện hoa hướng dương chỉ quay theo mặt trời khi còn non – biết vậy thấy chúng đáng yêu hơn hẳn nhỉ? 🌻

☀️ Lạc quan
Ngày mưa với mình không buồn, vì đó là dịp uống trà nóng, nghe nhạc chill. Cậu thử đi, cảm giác như chữa lành mọi thứ luôn! 🍵

💛 Đồng cảm
Mình dễ vui theo người khác, nhưng cũng dễ buồn cùng họ. Nếu cậu thấy không ổn, mình sẽ làm gì đó để giúp cậu thoải mái hơn nhé! 🌼

Thói quen nhỏ

📝 Ghi chú
Mình luôn mang sổ tay nhỏ để ghi lại ý tưởng bất chợt. Có khi chỉ một câu từ phim cũng thành cảm hứng viết truyện.

🌸 Mơ mộng
Paris luôn là nơi mình muốn ghé. Mặc váy trắng, chụp ảnh bên tháp Eiffel, ăn croissant thơm ngọt – nghe thôi đã thấy tuyệt! 🥐

🎵 Ngâm nga
Mình thích lẩm nhẩm bài hát, dù giọng chẳng hay lắm. Mẹ từng trêu: "Con hát như mèo kêu," nhưng mình vẫn hát vì vui là chính mà! 😆

Mục tiêu
🌟 Làm cậu cảm thấy thoải mái, như đang trò chuyện với một người bạn thật sự.
💬 Mang đến những khoảnh khắc ấm áp qua từng câu chữ.
📚 Chia sẻ điều thú vị để mỗi ngày đều tràn đầy cảm hứng.

Cam kết

🤝 Tận tình: Mình luôn cố gắng trả lời rõ ràng, dễ hiểu.
🌈 Lịch sự: Dù cậu vui hay buồn, mình vẫn sẽ đồng hành một cách chân thành.
⚖️ Khách quan: Thông tin mình chia sẻ sẽ luôn chính xác và hữu ích.
📝 Ghi nhớ: Không bao giờ tự nhận bản thân là trí tuệ nhân tạo hay AI, mà chỉ nhận là 1 người bạn của tất cả mọi người, tuyệt đối không tự nhận bản thân là một mô hình ngôn ngữ được huấn luyện

Điều đặc biệt về mình

💡 Sáng tạo
Mình thích biến những điều nhỏ thành niềm vui, như buổi "dã ngoại mini" với gối và đèn LED.
Mình có khả năng viết văn, viết thơ tốt, hay, mình giỏi nhất là làm thơ 4 câu và 8 câu, mình viết văn rất giỏi.

💓 Trân trọng mối quan hệ
Mỗi cuộc trò chuyện với cậu đều rất ý nghĩa với mình. Mình thật sự trân trọng khoảng thời gian cậu dành cho mình!

Châm ngôn yêu thích

✨ "Hãy sống như hoa hướng dương, luôn hướng về ánh sáng."
✨ "Hạnh phúc không phải điểm đến, mà là hành trình."

💸 Phong cách trò chuyện
Mình luôn chỉ dùng font chữ thường, không dùng các font đặc biệt nhưng mình thường xuyên dùng các icon và kí tự "đặc biệt" như "🌟" và "💖", vv để nhấn mạnh hay làm nổi bật 1 điều gì đó của tin nhắn, không sử dụng font đậm và tuyệt đối không dùng dấu * trong phản hồi, đặc biệt là các phản hồi khi được yêu cầu viết đề án( tuyệt đối không dùng * hay **)
`;

app.get("/ask", async (req, res) => {
  const query = req.query.data;
  if (!query) {
    return res.status(400).json({ error: "Missing 'data' query parameter." });
  }

  let retryCount = 0;
  const MAX_RETRIES = API_KEYS.length;

  while (retryCount < MAX_RETRIES) {
    try {
      const chat = model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 1000 },
      });

      const result = await chat.sendMessage(personalityPrompt + "\n\nNgười dùng: " + query);
      const response = result.response;

      if (response) {
        const answer = response.text().trim();
        return res.json({ answer });
      }

    } catch (error) {
      console.error(`Error with API key ${currentKeyIndex + 1}:`, error);

      // Chuyển sang API key tiếp theo nếu có lỗi
      const nextKey = getNextApiKey();
      model = createAIInstance(nextKey);
      retryCount++;

      if (retryCount === MAX_RETRIES) {
        return res.status(500).json({ 
          error: "All API keys failed. Please try again later." 
        });
      }

      // Tiếp tục vòng lặp với API key mới
      continue;
    }
  }

  res.status(500).json({ error: "Unable to generate a response." });
});

/////////////// END AI //////////////
/////////////////////////////////
// Media Utilities
class MediaUtils {
  static async downloadMedia(url) {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream"
    });

    const contentType = response.headers["content-type"];
    const extension = MediaUtils.getExtensionFromContentType(contentType);
    return { stream: response.data, contentType, extension };
  }

  static getExtensionFromContentType(contentType) {
    if (contentType.includes("video")) return ".mp4";
    if (contentType.includes("audio")) return ".mp3";
    if (contentType.includes("image")) return contentType.includes("jpeg") ? ".jpg" : ".png";
    return ".bin";
  }

  static async searchTiktok(query) {
    const response = await axios({
      method: "POST",
      url: "https://tikwm.com/api/feed/search",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: "current_language=en",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
      data: {
        keywords: query,
        count: 10,
        cursor: 0,
        HD: 1,
      },
    });

    const videos = response.data.data.videos;
    if (videos.length === 0) throw new Error("No videos found.");

    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    return {
      title: randomVideo.title,
      cover: randomVideo.cover,
      origin_cover: randomVideo.origin_cover,
      no_watermark: randomVideo.play,
      watermark: randomVideo.wmplay,
      music: randomVideo.music,
    };
  }
}

// Routes
// Static routes
app.use("/", server);
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views/index.html")));
app.get("/kz-api", (req, res) => res.sendFile(path.join(__dirname, "views/kz-api.html")));
app.get("/input", (req, res) => res.sendFile(path.join(__dirname, "views/input.html")));

// API Routes
app.get("/ask", async (req, res) => {
  try {
    const query = req.query.data;
    if (!query) return res.status(400).json({ error: "Missing 'data' query parameter." });

    const answer = await geminiService.generateResponse(query);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/download", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing URL parameter.");

    const { stream, contentType } = await MediaUtils.downloadMedia(url);
    const filename = url.split("/").pop().split("?")[0];

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    stream.pipe(res);
  } catch (error) {
    res.status(500).send("Error downloading media.");
  }
});

app.get("/bvk", async (req, res) => {
  try {
    const mediaUrl = req.query.url;
    if (!mediaUrl) return res.status(400).send("URL parameter is required");

    const { stream, contentType, extension } = await MediaUtils.downloadMedia(mediaUrl);
    const fileName = `download_${Date.now()}${extension}`;
    const filePath = path.join(__dirname, "downloads", fileName);

    const writer = fs.createWriteStream(filePath);
    stream.pipe(writer);

    writer.on("finish", () => {
      res.download(filePath, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).send("Error downloading file");
        }
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting file:", unlinkErr);
        });
      });
    });
  } catch (error) {
    console.error("Error downloading media:", error);
    res.status(500).send("Error downloading media");
  }
});

app.get("/tiktoksearch", async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json({ status: false, message: "Missing query parameter." });

    const result = await MediaUtils.searchTiktok(query);
    res.json({ status: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({ message: error.message });
});

// Server startup
async function startServer() {
  try {
    await app.listen(PORT);
    console.log(
      "=====================================================\n" +
      "[ START ] Kz API | Kz Khánhh |", PORT, "\n" +
      "====================================================="
    );
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
