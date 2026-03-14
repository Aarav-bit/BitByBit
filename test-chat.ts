import { processUserMessage } from "./lib/ai/engine";
import { db } from "./lib/db";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  try {
    console.log("Starting test...");
    // Get a real user ID from the DB
    const user = await db.user.findFirst();
    if (!user) {
      console.log("No user found in DB");
      return;
    }

    console.log(`Testing with user: ${user.name} (${user.id})`);
    
    const result = await processUserMessage(
      user.id,
      "test-session-" + Date.now(),
      "Hi, tell me about this project"
    );

    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await db.$disconnect();
  }
}

test();
