/**
 * Normalize pose coordinates relative to hip center
 * @param {Array<Object>} keypoints - Array of keypoint objects with x, y, score, and name
 * @returns {Array<Object>} Normalized keypoints
 */
function normalizePose(keypoints) {
// Find hip center as reference point
const leftHip = keypoints.find(point => point.name === "left_hip");
const rightHip = keypoints.find(point => point.name === "right_hip");
const refX = (leftHip.x + rightHip.x) / 2;
const refY = (leftHip.y + rightHip.y) / 2;

// Calculate scale factor based on hip width
const scale = Math.sqrt(
    Math.pow(leftHip.x - rightHip.x, 2) + 
    Math.pow(leftHip.y - rightHip.y, 2)
);

return keypoints.map(point => ({
    name: point.name,
    x: (point.x - refX) / scale,
    y: (point.y - refY) / scale,
    score: point.score
}));
}

/**
 * Calculate angle between three points
 * @param {Object} p1 - First point
 * @param {Object} p2 - Middle point (vertex)
 * @param {Object} p3 - Third point
 * @returns {number} Angle in degrees
 */
function calculateAngle(p1, p2, p3) {
const vector1 = {
    x: p1.x - p2.x,
    y: p1.y - p2.y
};
const vector2 = {
    x: p3.x - p2.x,
    y: p3.y - p2.y
};

const dot = vector1.x * vector2.x + vector1.y * vector2.y;
const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

const cosAngle = dot / (mag1 * mag2);
const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
return angle * (180 / Math.PI);
}
/**
 * Compute similarity between current pose and reference pose
 * @param {Array<Object>} currentPose - Current pose keypoints
 * @param {Array<Object>} referencePose - Reference pose keypoints
 * @param {Object} options - Configuration options
 * @returns {number} Similarity score between 0 and 1
 */
function computePoseSimilarity(currentPose, referencePose, {
angleWeight = 0.6,
distanceWeight = 0.4,
confidenceThreshold = 0.3
} = {}) {
const current = normalizePose(currentPose);
const reference = normalizePose(referencePose);

// Define key joint pairs for angle calculation
const anglePairs = [
// ["right_shoulder", "right_elbow", "right_wrist"],
// ["left_shoulder", "left_elbow", "left_wrist"],
["right_hip", "right_knee", "right_ankle"],
["left_hip", "left_knee", "left_ankle"],
["right_shoulder", "right_hip", "right_knee"],
["left_shoulder", "left_hip", "left_knee"],
["right_hip", "right_shoulder", "right_elbow"],
["left_hip", "left_shoulder", "left_elbow"]
];

// Compare angles
let angleSimilarity = 0;
let validAngles = 0;

anglePairs.forEach(([p1Name, p2Name, p3Name]) => {
    const currPoints = [
        current.find(p => p.name === p1Name),
        current.find(p => p.name === p2Name),
        current.find(p => p.name === p3Name)
    ];
    
    const refPoints = [
        reference.find(p => p.name === p1Name),
        reference.find(p => p.name === p2Name),
        reference.find(p => p.name === p3Name)
    ];
    
    if (currPoints.every(p => p && p.score > confidenceThreshold) &&
        refPoints.every(p => p && p.score > confidenceThreshold)) {
        const currAngle = calculateAngle(...currPoints);
        const refAngle = calculateAngle(...refPoints);
        
        const angleDiff = Math.abs(currAngle - refAngle);
        angleSimilarity += Math.max(0, 1 - angleDiff / 180);
        validAngles++;
    }
});

if (validAngles > 0) {
    angleSimilarity /= validAngles;
}

// Compare point distances
let distanceSimilarity = 0;
let validPoints = 0;

current.forEach(currPoint => {
    const refPoint = reference.find(p => p.name === currPoint.name);
    if (refPoint && currPoint.score > confidenceThreshold && 
        refPoint.score > confidenceThreshold) {
        const distance = Math.sqrt(
            Math.pow(currPoint.x - refPoint.x, 2) + 
            Math.pow(currPoint.y - refPoint.y, 2)
        );
        distanceSimilarity += Math.max(0, 1 - distance);
        validPoints++;
    }
});

if (validPoints > 0) {
    distanceSimilarity /= validPoints;
}

// Combine scores with weights
return (angleWeight * angleSimilarity + 
        distanceWeight * distanceSimilarity);
}

/**
 * Check if current pose matches reference pose within threshold
 * @param {Array<Object>} currentPose - Current pose keypoints
 * @param {Array<Object>} referencePose - Reference pose keypoints
 * @param {number} threshold - Similarity threshold (0 to 1)
 * @returns {boolean} Whether pose is correct
 */
function comparePoses(currentPose, referencePose, threshold = 0.8) {
const similarity = computePoseSimilarity(currentPose, referencePose);
return similarity >= threshold;
}

export default comparePoses;