import type { JobId } from "@codigdex/game-content/domain/player/jobs";
import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";

export interface CareerRegion {
  id: string;
  label: LocalizedText;
  /** Legacy route-disc center, retained for map composition references. */
  x: number;
  y: number;
  /** Illustrated destination bounds and its non-rectangular interactive outline. */
  landmark: { x: number; y: number; width: number; height: number };
  focusPoints: readonly Point[];
  /** Tight visual silhouette lifted on hover; kept separate from the forgiving hit area. */
  lift: {
    x: number;
    y: number;
    width: number;
    height: number;
    points: readonly Point[];
  };
}

export interface CareerPathDefinition {
  jobId: JobId;
  textureKey: string;
  assetKey: string;
  title: LocalizedText;
  regions: readonly CareerRegion[];
  /** Final captures that prove every chapter in this primary path is complete. */
  completionCaptureIds: readonly string[];
}

export function careerTerrainTextureKey(path: CareerPathDefinition, region: CareerRegion): string {
  return `${path.textureKey}-${region.id}-terrain`;
}

export function careerTerrainAssetKey(path: CareerPathDefinition, region: CareerRegion): string {
  return `wallpapers/career-paths/${path.jobId}-${region.id}-terrain-v3.png`;
}

export function careerChapterWallpaperTextureKey(
  path: CareerPathDefinition,
  region: CareerRegion
): string {
  return `${path.textureKey}-${region.id}-chapter-wallpaper`;
}

export function careerChapterWallpaperAssetKey(
  path: CareerPathDefinition,
  region: CareerRegion
): string {
  return `wallpapers/career-chapters/${path.jobId}-${region.id}-wallpaper-v1.png`;
}

export type Point = readonly [x: number, y: number];

const region = (
  id: string,
  label: LocalizedText,
  [x, y]: Point,
  outline: readonly Point[],
  objectOutline: readonly Point[]
): CareerRegion => {
  const xs = outline.map(([pointX]) => pointX);
  const ys = outline.map(([, pointY]) => pointY);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  const landmarkX = (left + right) / 2;
  const landmarkY = (top + bottom) / 2;
  const objectXs = objectOutline.map(([pointX]) => pointX);
  const objectYs = objectOutline.map(([, pointY]) => pointY);
  const objectLeft = Math.min(...objectXs);
  const objectRight = Math.max(...objectXs);
  const objectTop = Math.min(...objectYs);
  const objectBottom = Math.max(...objectYs);
  return {
    id,
    label,
    x,
    y,
    landmark: { x: landmarkX, y: landmarkY, width: right - left, height: bottom - top },
    // Phaser Polygon expects points in a top-left local coordinate space when
    // its Game Object is positioned at the bounds center with the default
    // 0.5 origin. Keeping points positive also makes its interactive bounds
    // match the painted landmark exactly.
    focusPoints: outline.map(([pointX, pointY]) => [pointX - left, pointY - top]),
    lift: {
      x: (objectLeft + objectRight) / 2,
      y: (objectTop + objectBottom) / 2,
      width: objectRight - objectLeft,
      height: objectBottom - objectTop,
      points: objectOutline.map(([pointX, pointY]) => [
        pointX - objectLeft,
        pointY - objectTop,
      ]),
    },
  };
};

const CAREER_PATH_DEFINITIONS: Record<
  JobId,
  Omit<CareerPathDefinition, "completionCaptureIds">
> = {
  frontend: {
    jobId: "frontend",
    textureKey: "world-career-frontend-v3",
    assetKey: "wallpapers/career-paths/frontend-path-map-v3.png",
    title: text("웹 프론트엔드 개발자 경로", "Web Frontend Developer Path"),
    regions: [
      region("html-css", text("HTML/CSS", "HTML/CSS"), [164, 384], [[18, 292], [70, 263], [151, 263], [211, 289], [253, 337], [244, 397], [190, 431], [83, 426], [22, 394]], [[30, 337], [56, 337], [56, 292], [82, 292], [82, 270], [109, 270], [109, 307], [143, 307], [143, 289], [174, 289], [174, 321], [211, 321], [211, 348], [230, 348], [230, 391], [199, 391], [199, 414], [153, 414], [153, 430], [94, 430], [94, 414], [48, 414], [48, 391], [24, 391], [24, 355]]),
      region("javascript", text("JavaScript", "JavaScript"), [339, 265], [[193, 148], [227, 113], [309, 104], [371, 132], [397, 190], [381, 247], [330, 279], [250, 272], [202, 230]], [[207, 181], [224, 181], [224, 151], [243, 151], [243, 130], [270, 119], [301, 130], [319, 151], [319, 171], [342, 171], [342, 153], [375, 153], [375, 207], [357, 207], [357, 232], [329, 232], [329, 249], [275, 249], [275, 238], [237, 238], [237, 215], [207, 215]]),
      region("http-api", text("브라우저 · HTTP", "Browser · HTTP"), [487, 384], [[351, 311], [404, 282], [510, 282], [584, 306], [609, 357], [580, 405], [503, 428], [415, 414], [362, 373]], [[351, 329], [391, 329], [391, 293], [411, 293], [411, 270], [438, 270], [438, 306], [505, 306], [505, 269], [531, 269], [531, 306], [568, 306], [568, 329], [604, 329], [604, 367], [583, 367], [583, 405], [548, 405], [548, 425], [509, 425], [509, 407], [458, 407], [458, 429], [410, 429], [410, 405], [374, 405], [374, 369], [351, 369]]),
      region("react", text("React", "React"), [691, 305], [[618, 165], [665, 133], [743, 135], [794, 174], [810, 238], [783, 303], [724, 335], [655, 321], [614, 267]], [[619, 205], [642, 205], [642, 174], [668, 174], [668, 145], [694, 145], [694, 181], [716, 181], [716, 144], [742, 144], [742, 179], [768, 179], [768, 157], [791, 174], [791, 211], [806, 211], [806, 258], [786, 258], [786, 292], [757, 292], [757, 315], [709, 315], [709, 299], [663, 299], [663, 279], [635, 279], [635, 253], [619, 253]]),
      region("frontend-testing", text("프론트엔드 테스트", "Frontend testing"), [839, 119], [[816, 31], [853, 8], [907, 12], [945, 48], [951, 111], [918, 166], [866, 196], [814, 170], [792, 105]], [[803, 65], [824, 65], [824, 36], [851, 36], [851, 17], [900, 17], [900, 29], [927, 29], [927, 61], [945, 61], [945, 111], [927, 111], [927, 145], [905, 145], [905, 169], [857, 169], [857, 151], [823, 151], [823, 126], [803, 126]]),
    ],
  },
  backend: {
    jobId: "backend",
    textureKey: "world-career-backend-v3",
    assetKey: "wallpapers/career-paths/backend-path-map-v3.png",
    title: text("백엔드 개발자 경로", "Backend Developer Path"),
    regions: [
      region("http-api", text("HTTP/API", "HTTP/API"), [109, 416], [[20, 353], [72, 324], [139, 329], [184, 365], [184, 425], [146, 468], [76, 480], [21, 449]], [[0, 383], [33, 383], [33, 354], [66, 354], [66, 331], [111, 331], [111, 349], [145, 349], [145, 379], [172, 379], [172, 422], [146, 422], [146, 459], [113, 459], [113, 488], [63, 488], [63, 469], [25, 469], [25, 444], [0, 444]]),
      region("server-framework", text("서버 프레임워크", "Server framework"), [262, 195], [[40, 75], [83, 45], [151, 49], [204, 82], [224, 140], [208, 199], [159, 229], [88, 218], [45, 175]], [[42, 92], [62, 92], [62, 67], [92, 67], [92, 49], [142, 49], [142, 62], [172, 62], [172, 83], [200, 83], [200, 113], [220, 113], [220, 172], [203, 172], [203, 205], [174, 205], [174, 225], [110, 225], [110, 214], [72, 214], [72, 191], [48, 191], [48, 158], [36, 158], [36, 117], [42, 117]]),
      region("sql", text("데이터베이스 · SQL", "Database · SQL"), [447, 205], [[371, 119], [402, 94], [481, 92], [525, 119], [535, 180], [505, 224], [438, 238], [383, 210]], [[375, 136], [397, 136], [397, 111], [421, 111], [421, 95], [486, 95], [486, 108], [512, 108], [512, 134], [530, 134], [530, 193], [511, 193], [511, 218], [481, 218], [481, 234], [426, 234], [426, 222], [397, 222], [397, 204], [375, 204]]),
      region("security-auth", text("인증 · 보안", "Auth · Security"), [605, 145], [[537, 66], [577, 39], [633, 42], [674, 73], [688, 126], [657, 174], [595, 187], [543, 151]], [[540, 82], [558, 82], [558, 57], [577, 57], [577, 41], [638, 41], [638, 57], [661, 57], [661, 82], [680, 82], [680, 137], [661, 137], [661, 164], [634, 164], [634, 181], [579, 181], [579, 166], [557, 166], [557, 143], [540, 143]]),
      region("network", text("네트워크", "Networking"), [750, 230], [[661, 173], [704, 145], [776, 145], [838, 177], [865, 224], [842, 274], [777, 298], [703, 281], [662, 235]], [[656, 194], [679, 194], [679, 169], [710, 169], [710, 150], [744, 150], [744, 166], [777, 166], [777, 146], [804, 146], [804, 177], [836, 177], [836, 202], [858, 202], [858, 253], [837, 253], [837, 277], [798, 277], [798, 292], [744, 292], [744, 282], [704, 282], [704, 261], [676, 261], [676, 235], [656, 235]]),
      region("docker", text("Docker", "Docker"), [810, 353], [[753, 297], [808, 275], [884, 292], [937, 325], [956, 380], [927, 426], [862, 447], [789, 428], [750, 383]], [[748, 321], [775, 321], [775, 294], [812, 294], [812, 278], [861, 278], [861, 290], [902, 290], [902, 310], [934, 310], [934, 342], [955, 342], [955, 398], [935, 398], [935, 425], [901, 425], [901, 443], [845, 443], [845, 432], [799, 432], [799, 413], [769, 413], [769, 386], [748, 386]]),
    ],
  },
  devops: {
    jobId: "devops",
    textureKey: "world-career-devops-v3",
    assetKey: "wallpapers/career-paths/devops-path-map-v3.png",
    title: text("DevOps 엔지니어 경로", "DevOps Engineer Path"),
    regions: [
      region("network", text("네트워크", "Networking"), [80, 435], [[1, 347], [31, 308], [90, 300], [130, 330], [138, 381], [118, 440], [70, 465], [20, 450]], [[0, 373], [21, 373], [21, 335], [43, 335], [43, 306], [77, 306], [77, 322], [101, 322], [101, 350], [124, 350], [124, 391], [137, 391], [137, 431], [113, 431], [113, 455], [78, 455], [78, 472], [35, 472], [35, 455], [5, 455]]),
      region("docker", text("Docker", "Docker"), [220, 379], [[116, 318], [165, 286], [235, 286], [286, 308], [320, 347], [314, 380], [282, 412], [230, 430], [175, 420], [124, 385]], [[116, 337], [142, 337], [142, 309], [176, 309], [176, 291], [230, 291], [230, 300], [271, 300], [271, 320], [301, 320], [301, 342], [319, 342], [319, 381], [294, 381], [294, 408], [258, 408], [258, 426], [196, 426], [196, 418], [154, 418], [154, 399], [126, 399], [126, 376], [116, 376]]),
      region("cicd", text("CI/CD", "CI/CD"), [395, 315], [[282, 221], [327, 184], [411, 177], [460, 205], [482, 257], [458, 318], [405, 350], [350, 340], [315, 318], [282, 291]], [[282, 245], [304, 245], [304, 214], [331, 214], [331, 190], [367, 190], [367, 179], [412, 179], [412, 194], [444, 194], [444, 218], [465, 218], [465, 249], [480, 249], [480, 289], [460, 289], [460, 319], [424, 319], [424, 340], [372, 340], [372, 331], [331, 331], [331, 312], [301, 312], [301, 287], [282, 287]]),
      region("kubernetes", text("Kubernetes", "Kubernetes"), [520, 225], [[450, 125], [481, 91], [548, 91], [607, 121], [632, 177], [611, 232], [554, 266], [486, 252], [456, 207]], [[450, 149], [469, 149], [469, 119], [493, 119], [493, 98], [542, 98], [542, 106], [574, 106], [574, 126], [604, 126], [604, 151], [625, 151], [625, 199], [609, 199], [609, 230], [579, 230], [579, 252], [530, 252], [530, 263], [491, 252], [491, 235], [466, 235], [466, 207], [450, 207]]),
      region("cloud-iac", text("Cloud · IaC", "Cloud · IaC"), [646, 369], [[526, 306], [575, 267], [660, 262], [741, 288], [780, 340], [757, 397], [687, 427], [605, 417], [539, 371]], [[523, 330], [548, 330], [548, 298], [578, 298], [578, 278], [623, 278], [623, 264], [677, 264], [677, 276], [720, 276], [720, 296], [753, 296], [753, 320], [775, 320], [775, 369], [758, 369], [758, 398], [721, 398], [721, 419], [670, 419], [670, 428], [620, 419], [620, 409], [579, 409], [579, 389], [545, 389], [545, 368], [523, 368]]),
      region("monitoring", text("모니터링", "Monitoring"), [740, 205], [[648, 93], [693, 52], [754, 48], [810, 80], [836, 136], [818, 201], [770, 241], [704, 234], [660, 191]], [[649, 117], [669, 117], [669, 82], [696, 82], [696, 55], [731, 55], [731, 45], [759, 45], [759, 62], [790, 62], [790, 86], [814, 86], [814, 118], [834, 118], [834, 169], [816, 169], [816, 200], [787, 200], [787, 226], [748, 226], [748, 240], [704, 233], [704, 216], [674, 216], [674, 190], [655, 190], [655, 151], [649, 151]]),
    ],
  },
  "data-engineer": {
    jobId: "data-engineer",
    textureKey: "world-career-data-engineer-v3",
    assetKey: "wallpapers/career-paths/data-engineer-path-map-v3.png",
    title: text("데이터 엔지니어 경로", "Data Engineer Path"),
    regions: [
      region("python", text("Python", "Python"), [114, 400], [[17, 333], [60, 290], [125, 281], [189, 306], [224, 355], [215, 415], [168, 459], [91, 470], [30, 431]], [[18, 345], [43, 345], [43, 313], [72, 313], [72, 293], [116, 293], [116, 304], [155, 304], [155, 324], [190, 324], [190, 350], [216, 350], [216, 399], [202, 399], [202, 427], [174, 427], [174, 451], [132, 451], [132, 468], [87, 468], [87, 455], [52, 455], [52, 435], [27, 435], [27, 407], [18, 407]]),
      region("sql", text("SQL · 데이터 모델링", "SQL · Data modeling"), [229, 203], [[130, 143], [177, 101], [252, 89], [330, 111], [380, 158], [378, 219], [329, 267], [253, 287], [176, 259], [132, 210]], [[127, 166], [151, 166], [151, 132], [181, 132], [181, 108], [224, 108], [224, 96], [274, 96], [274, 107], [319, 107], [319, 130], [350, 130], [350, 157], [375, 157], [375, 211], [357, 211], [357, 239], [328, 239], [328, 263], [286, 263], [286, 280], [235, 280], [235, 270], [191, 270], [191, 250], [158, 250], [158, 224], [135, 224], [135, 197], [127, 197]]),
      region("data-pipeline", text("데이터 파이프라인", "Data pipelines"), [455, 369], [[383, 309], [430, 269], [510, 257], [582, 284], [624, 333], [611, 391], [555, 435], [476, 445], [411, 410]], [[382, 329], [406, 329], [406, 299], [435, 299], [435, 274], [476, 274], [476, 260], [526, 260], [526, 273], [566, 273], [566, 294], [599, 294], [599, 320], [620, 320], [620, 368], [605, 368], [605, 397], [574, 397], [574, 423], [534, 423], [534, 439], [484, 439], [484, 429], [443, 429], [443, 411], [411, 411], [411, 386], [390, 386], [390, 356], [382, 356]]),
      region("docker", text("Docker", "Docker"), [709, 157], [[612, 62], [655, 25], [721, 22], [770, 52], [792, 109], [775, 150], [756, 180], [710, 198], [665, 190], [620, 151]], [[611, 86], [632, 86], [632, 54], [658, 54], [658, 31], [690, 31], [690, 19], [728, 19], [728, 34], [757, 34], [757, 57], [779, 57], [779, 89], [791, 89], [791, 131], [777, 131], [777, 158], [754, 158], [754, 183], [716, 183], [716, 197], [674, 190], [674, 176], [642, 176], [642, 153], [619, 153], [619, 121], [611, 121]]),
      region("orchestration", text("오케스트레이션", "Orchestration"), [785, 284], [[710, 198], [756, 180], [807, 163], [866, 194], [893, 246], [878, 305], [827, 344], [761, 340], [713, 302]], [[707, 219], [730, 219], [730, 194], [759, 194], [759, 173], [810, 173], [810, 184], [848, 184], [848, 205], [875, 205], [875, 232], [891, 232], [891, 276], [879, 276], [879, 306], [851, 306], [851, 330], [813, 330], [813, 343], [770, 343], [770, 333], [740, 333], [740, 310], [717, 310], [717, 283], [707, 283]]),
      region("monitoring", text("모니터링", "Monitoring"), [858, 74], [[794, 25], [826, 1], [895, 1], [944, 28], [958, 75], [938, 123], [890, 151], [833, 140], [798, 101]], [[793, 46], [813, 46], [813, 20], [838, 20], [838, 2], [892, 2], [892, 13], [921, 13], [921, 33], [944, 33], [944, 61], [958, 61], [958, 98], [941, 98], [941, 123], [913, 123], [913, 142], [873, 142], [873, 151], [834, 141], [834, 126], [808, 126], [808, 104], [793, 104]]),
    ],
  },
  "data-analyst": {
    jobId: "data-analyst",
    textureKey: "world-career-data-analyst-v3",
    assetKey: "wallpapers/career-paths/data-analyst-path-map-v3.png",
    title: text("데이터 분석가 경로", "Data Analyst Path"),
    regions: [
      region("sql", text("SQL", "SQL"), [272, 412], [[3, 350], [50, 319], [122, 310], [195, 327], [241, 368], [245, 423], [205, 469], [130, 486], [55, 465], [8, 418]], [[0, 365], [24, 365], [24, 338], [55, 338], [55, 319], [96, 319], [96, 310], [143, 310], [143, 321], [182, 321], [182, 339], [215, 339], [215, 365], [239, 365], [239, 420], [225, 420], [225, 449], [196, 449], [196, 473], [150, 473], [150, 485], [102, 485], [102, 475], [58, 475], [58, 456], [26, 456], [26, 432], [5, 432], [5, 400], [0, 400]]),
      region("statistics", text("기초 통계", "Basic statistics"), [431, 326], [[194, 251], [253, 215], [339, 211], [418, 233], [466, 278], [462, 331], [414, 369], [332, 381], [256, 359], [207, 316]], [[192, 274], [219, 274], [219, 244], [254, 244], [254, 222], [299, 222], [299, 211], [346, 211], [346, 222], [389, 222], [389, 240], [428, 240], [428, 261], [459, 261], [459, 307], [469, 307], [469, 333], [449, 333], [449, 357], [415, 357], [415, 374], [368, 374], [368, 382], [318, 382], [318, 371], [274, 371], [274, 354], [236, 354], [236, 332], [207, 332], [207, 307], [192, 307]]),
      region("visualization", text("데이터 시각화", "Data visualization"), [580, 241], [[448, 155], [492, 116], [559, 104], [625, 126], [664, 166], [660, 218], [620, 257], [552, 270], [488, 248], [449, 207]], [[447, 176], [469, 176], [469, 145], [495, 145], [495, 120], [531, 120], [531, 106], [575, 106], [575, 116], [613, 116], [613, 137], [641, 137], [641, 164], [660, 164], [660, 208], [646, 208], [646, 233], [619, 233], [619, 255], [581, 255], [581, 268], [538, 268], [538, 257], [500, 257], [500, 239], [472, 239], [472, 215], [451, 215], [451, 190], [447, 190]]),
      region("bi-tools", text("BI 도구", "BI tools"), [747, 183], [[704, 55], [752, 11], [829, 1], [903, 23], [949, 66], [958, 122], [925, 172], [900, 183], [850, 202], [790, 195], [725, 146]], [[703, 74], [725, 74], [725, 43], [751, 43], [751, 19], [786, 19], [786, 2], [839, 2], [839, 14], [880, 14], [880, 34], [913, 34], [913, 58], [940, 58], [940, 88], [958, 88], [958, 124], [941, 124], [941, 151], [916, 151], [916, 176], [881, 176], [881, 195], [835, 195], [835, 202], [793, 195], [793, 184], [756, 184], [756, 165], [728, 165], [728, 142], [708, 142], [708, 108], [703, 108]]),
      region("python", text("분석용 Python", "Python for analysis"), [811, 282], [[790, 202], [850, 202], [900, 183], [925, 229], [957, 273], [946, 320], [899, 354], [831, 362], [772, 337], [741, 289], [747, 233]], [[744, 238], [764, 238], [764, 215], [794, 215], [794, 199], [844, 199], [844, 191], [889, 191], [889, 207], [919, 207], [919, 232], [941, 232], [941, 260], [957, 260], [957, 297], [944, 297], [944, 325], [915, 325], [915, 346], [874, 346], [874, 359], [827, 359], [827, 351], [787, 351], [787, 335], [759, 335], [759, 310], [741, 310], [741, 274], [744, 274]]),
    ],
  },
};

function releasedCompletionCaptureIds(
  regions: readonly CareerRegion[]
): readonly string[] {
  return regions.flatMap((careerRegion) => {
    const finalMonster = monstersForCareerRegion(careerRegion.id).at(-1);
    return finalMonster ? [finalMonster.id] : [];
  });
}

/** Completion requirements stay in sync with the released regions and their final checkpoints. */
export const CAREER_PATHS: Record<JobId, CareerPathDefinition> = Object.fromEntries(
  (Object.entries(CAREER_PATH_DEFINITIONS) as [
    JobId,
    Omit<CareerPathDefinition, "completionCaptureIds">,
  ][]).map(([jobId, path]) => [
    jobId,
    { ...path, completionCaptureIds: releasedCompletionCaptureIds(path.regions) },
  ])
) as Record<JobId, CareerPathDefinition>;

export function careerPathFor(jobId: JobId): CareerPathDefinition {
  return CAREER_PATHS[jobId];
}

/** Completion is derived from the dex, so it stays valid across saves and shared chapters. */
export function isCareerPathComplete(
  path: CareerPathDefinition,
  captured: ReadonlySet<string>
): boolean {
  const required = path.completionCaptureIds;
  return required.length > 0 && required.every((id) => captured.has(id));
}

/** A selected career remains binding until every released requirement is complete. */
export function canLeaveCareerPath(
  path: CareerPathDefinition,
  captured: ReadonlySet<string>
): boolean {
  return isCareerPathComplete(path, captured);
}

/** Every completed primary career, derived solely from its required dex captures. */
export function completedCareerPathIds(
  captured: ReadonlySet<string>,
  paths: Readonly<Record<JobId, CareerPathDefinition>> = CAREER_PATHS
): ReadonlySet<JobId> {
  return new Set(
    (Object.keys(paths) as JobId[]).filter((jobId) =>
      isCareerPathComplete(paths[jobId], captured)
    )
  );
}
