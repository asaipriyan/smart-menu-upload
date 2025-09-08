import {
  TextractClient,
  AnalyzeDocumentCommand,
} from "@aws-sdk/client-textract";
import { readFileSync } from "fs";

const client = new TextractClient({ region: "us-east-1" });

export async function extractText(filePath: string): Promise<string> {
  const fileBytes = readFileSync(filePath);

  const command = new AnalyzeDocumentCommand({
    Document: { Bytes: fileBytes },
    FeatureTypes: ["TABLES", "FORMS"], // capture structured data
  });

  const response = await client.send(command);

  let extractedText = "";

  if (response.Blocks) {
    for (const block of response.Blocks) {
      if (block.BlockType === "LINE" && block.Text) {
        extractedText += block.Text + "\n";
      }
    }
  }

  return extractedText;
}
