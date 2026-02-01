import fs from 'fs';
import path from 'path';

async function testCallAnalysis() {
    console.log("🧪 Starting Call Analysis Test...");

    const dataPath = path.join(process.cwd(), 'test-analyze-call.json');
    if (!fs.existsSync(dataPath)) {
        console.error("❌ Error: test-analyze-call.json not found!");
        return;
    }

    const testData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log("\n📡 Sending request to /api/analyze-call...");

    try {
        const response = await fetch("http://localhost:3000/api/analyze-call", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Request failed");
        }

        const { analysis } = await response.json();

        console.log("\n✅ Analysis Result:");
        console.log("-------------------");
        console.log(JSON.stringify(analysis, null, 2));
        console.log("-------------------\n");

        console.log("💡 Tips for testing:");
        console.log("1. Edit test-analyze-call.json with different transcripts.");
        console.log("2. Run 'node test-analyze-call.mjs' to see how the AI handles it.");

    } catch (error) {
        console.error("\n❌ Test Failed:");
        console.error(error.message);
        console.log("\nMake sure your dev server is running on http://localhost:3000");
    }
}

testCallAnalysis();
