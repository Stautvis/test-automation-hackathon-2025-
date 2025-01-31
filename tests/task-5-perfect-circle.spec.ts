import { Page, test } from "playwright/test";

// URL: https://neal.fun/perfect-circle/
// Steps:
// 1. Open the page and press the "Go" button
// 2. Get center point
// 3. Get all points on the circle

type Coordinate = {
  x: number;
  y: number;
};

function getCirclePoints(
  center: Coordinate,
  radius: number,
  pointsNumber: number = radius
): { x: number; y: number }[] {
  const points: Coordinate[] = [];

  for (let i = 0; i < pointsNumber; i++) {
    const theta = (i / pointsNumber) * 2 * Math.PI;
    const x = center.x + radius * Math.cos(theta);
    const y = center.y + radius * Math.sin(theta);
    points.push({ x, y });
  }

  return points;
}

async function getSvgCenterInPageCoords(
  page: Page,
  svgSelector: string,
  radiusPercentage = 0.75
): Promise<[Coordinate, number]> {
  const svgBoundingBox = await page.locator(svgSelector).boundingBox();
  if (!svgBoundingBox) throw new Error("SVG element not found");

  return [
    {
      x: svgBoundingBox.x + svgBoundingBox.width / 2,
      y: svgBoundingBox.y + svgBoundingBox.height / 2,
    },
    Math.floor(svgBoundingBox.width / 2) * radiusPercentage,
  ];
}

async function drawCircle(page: Page, points: Coordinate[]) {
  const [firstPoint, ...restPoints] = points;
  await page.mouse.move(firstPoint.x, firstPoint.y);
  await page.mouse.down();

  for (const point of restPoints) {
    await page.mouse.move(point.x, point.y);
  }

  await page.mouse.up();
}

test.describe("Task 5: Perfect circle", async () => {
  test("1. Get the worst possible score - 3 points", async ({ page }) => {
    // Open the page and press the "Go" button
    await page.goto("https://neal.fun/perfect-circle/");
    await page.locator("button.fc-cta-consent").click();
    await page.getByRole("button", { name: "Go" }).click();

    // Get center point
    const radiusPercentage = 0.75;
    const [centerPoint, radius] = await getSvgCenterInPageCoords(page, "svg", radiusPercentage);

    // Get all points on the circle
    const points = [
      { x: centerPoint.x + radius * 0.3, y: centerPoint.y },
      ...getCirclePoints(centerPoint, radius),
    ];

    // Draw circle from points
    drawCircle(page, points);
    await page.waitForTimeout(10000);
  });

  test("2. Get the best possible score among all teams - 3 points", async ({ page }) => {
    // Open the page and press the "Go" button
    await page.goto("https://neal.fun/perfect-circle/");
    await page.locator("button.fc-cta-consent").click();
    await page.getByRole("button", { name: "Go" }).click();

    // Get center point
    const radiusPercentage = 0.75;
    const [centerPoint, radius] = await getSvgCenterInPageCoords(page, "svg", radiusPercentage);

    // Get all points on the circle
    const points = getCirclePoints(centerPoint, radius, radius * 1.2);

    // Draw circle from points
    drawCircle(page, points);
    await page.waitForTimeout(10000);
  });
  test("3. Score exactly 66.6% - 4 points", async ({ page }) => {
    // Open the page and press the "Go" button
    await page.goto("https://neal.fun/perfect-circle/");
    await page.locator("button.fc-cta-consent").click();
    await page.getByRole("button", { name: "Go" }).click();

    // Get center point
    const radiusPercentage = 0.76;
    const [centerPoint, radius] = await getSvgCenterInPageCoords(page, "svg", radiusPercentage);

    // Get all points on the circle
    const points = [
      { x: centerPoint.x + radius * 0.75, y: centerPoint.y },
      ...getCirclePoints(centerPoint, radius),
    ];

    // Draw circle from points
    drawCircle(page, points);
    await page.waitForTimeout(10000);
  });
});
