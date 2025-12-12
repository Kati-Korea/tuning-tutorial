import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

/**
 * Firebase Admin SDK 초기화
 * 서버사이드 (API Route)에서만 사용
 * n8n → API Route → Firestore 저장용
 */

// 이미 초기화되어 있으면 재초기화하지 않음
if (!getApps().length) {
  // service-account-key.json 직접 import
  const serviceAccount = require('../../service-account-key.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Firestore, Auth export
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
