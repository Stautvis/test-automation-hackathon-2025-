import { Locator, test } from "playwright/test";

// URL: https://www.mathsisfun.com/games/direction-bearing-.html
// Steps:
// 1. Open the URL
// 2. Select game mode
// 3. Get instructions and parse them to coordinates
// 4. Get start coordinate
// 5. Calculate end coordinate and press it
// 6. Wait 3 seconds for new game
// 7. Repeat the steps 3-6 for until the game score is reached

const SCORE = 500;
const RANGE_INDEX = 5;
const DIRECTION: { [key: string]: Coordinate } = {
  "000°": { x: 0, y: -30 },
  "090°": { x: 30, y: 0 },
  "180°": { x: 0, y: 30 },
  "270°": { x: -30, y: 0 },
} as const;
type Coordinate = { x: number; y: number };

function parseInstructionsToCoordinates(instructions: string): Coordinate[] {
  const steps = instructions.split("\n").filter((step) => step);
  return steps.map((step) => {
    const [count, _, direction] = step.split(" ");
    const coordinate = {
      x: DIRECTION[direction].x * parseInt(count),
      y: DIRECTION[direction].y * parseInt(count),
    };
    return coordinate;
  });
}

function calculateEndingPoint(start: Coordinate, steps: Coordinate[]): Coordinate {
  return steps.reduce((acc, step) => {
    return { x: acc.x + step.x, y: acc.y + step.y };
  }, start);
}

async function getCoordinatesFromLocator(locator: Locator): Promise<Coordinate> {
  const style = (await locator.getAttribute("style")) || "";
  const styleProperties = style.split(";");
  const regex = /(\d+)px/g;
  const left = styleProperties.find((property) => property.includes("left"))?.match(regex);
  const top = styleProperties.find((property) => property.includes("top"))?.match(regex);
  const coordinate: Coordinate = {
    x: parseInt(left![0].replace("px", "")),
    y: parseInt(top![0].replace("px", "")),
  };
  return coordinate;
}

test("Task 2: Follow the direction", async ({ page }) => {
  // Open the URL
  await page.goto("https://www.mathsisfun.com/games/direction-bearing-.html");
  const iframe = await page.frameLocator("iframe").first();

  // Select game mode
  const rangeTypeSelect = await iframe.locator("#rangeType");
  await rangeTypeSelect.scrollIntoViewIfNeeded();
  await rangeTypeSelect.selectOption({ index: RANGE_INDEX });
  let score = 0;

  while (score < SCORE) {
    // Get instructions and parse them to coordinates
    const instructions = await iframe.locator("#instr").innerText();
    const coordinates = parseInstructionsToCoordinates(instructions);

    // Get start coordinate
    const smile = await iframe.locator("#smile");
    const startCoordinates = await getCoordinatesFromLocator(smile);
    console.log("Start coordinates:", startCoordinates);

    // Calculate end coordinate and press it
    const endCoordinates = calculateEndingPoint(startCoordinates, coordinates);
    console.log("End coordinates:", endCoordinates);
    const endElement = await iframe.locator(
      `canvas[style*="left: ${endCoordinates.x}px; top: ${endCoordinates.y}px;"]`
    );
    await endElement.click();

    // Wait 3 seconds for new game
    await page.waitForTimeout(3000);
    score = parseInt(await iframe.locator("#score").innerText());
    console.log("Score:", score);
  }
});
