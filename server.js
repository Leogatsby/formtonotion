require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("@notionhq/client");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // 현재 디렉토리의 모든 파일을 정적 파일로 제공

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

// 노션 데이터베이스 ID 설정
const databaseId = process.env.NOTION_DATABASE_ID;

// HTML 파일 제공
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 폼 제출 처리
app.post("/submit", async (req, res) => {
  try {
    console.log("Received form data:", req.body);
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      throw new Error("모든 필드를 채워주세요.");
    }

    // 노션 데이터베이스에 새 페이지 생성
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId
      },
      properties: {
        이름: {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        Content: {
          rich_text: [
            {
              text: {
                content: content
              }
            }
          ]
        },
        Category: {
          select: {
            name: category
          }
        }
      }
    });

    console.log("Notion API response:", response);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Detailed error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
  console.log(
    "NOTION_API_KEY:",
    process.env.NOTION_API_KEY ? "설정됨" : "설정되지 않음"
  );
  console.log(
    "NOTION_DATABASE_ID:",
    process.env.NOTION_DATABASE_ID ? "설정됨" : "설정되지 않음"
  );
});
