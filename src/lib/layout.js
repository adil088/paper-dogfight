// Board geometry and shared helpers. All distances are in grid squares: the SVG viewBox is
// `cols x rows`, so one unit equals one square of the paper.

export const COLORS = { RED: '#d6322d', BLUE: '#1f5fd6' };
export const LANE_ORDER = ['LEFT', 'CENTER', 'RIGHT'];

/** Distance from a jet's centre to its nose. */
export const NOSE = 1;
/** Hidden lead-in so a line seems to come out from under the jet. */
export const LEAD = 0.4;
/** How far a line sits from its jet's axis; Red goes right, Blue goes left, so they never touch. */
export const LINE_OFFSET = 0.3;

/** How long the marker takes to draw `squares` squares. */
export const lineAnimSeconds = (squares) => 0.35 + 0.12 * Math.max(0, squares);

export const teamLabel = (team) => (team === 'RED' ? 'Red' : 'Blue');
export const jetNumber = (jetId) => jetId.slice(1);

/**
 * Where a jet and its line live on the sheet. Blue sits at the top in a V (centre jet lower),
 * Red mirrors it at the bottom. Red's position is derived from the lane gap sent by the server,
 * so changing the gap in the backend config moves the jets accordingly.
 */
export function jetLayout(config, jet) {
  const laneIdx = LANE_ORDER.indexOf(jet.lane);
  const middle = config.cols / 2;
  const x = [middle - 3.5, middle, middle + 3.5][laneIdx];
  const gap = config.laneGaps[laneIdx];
  const blueY = laneIdx === 1 ? 2.5 : 1.5;
  const blueNose = blueY + NOSE;
  const isBlue = jet.team === 'BLUE';
  const y = isBlue ? blueY : blueNose + gap + NOSE;
  const dir = isBlue ? 1 : -1; // direction the jet shoots, in y
  return {
    x,
    y,
    dir,
    noseY: y + dir * NOSE,
    lineX: x + (isBlue ? -LINE_OFFSET : LINE_OFFSET),
    gap,
    color: COLORS[jet.team],
    angle: isBlue ? 0 : 180,
  };
}
