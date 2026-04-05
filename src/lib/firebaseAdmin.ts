import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import config from '../config';

type ServiceAccountShape = {
  project_id: string;
  client_email: string;
  private_key: string;
};

const defaultServiceAccountPath = path.join(process.cwd(), 'admin-key.json');

const resolveServiceAccountPath = () => {
  return process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || defaultServiceAccountPath;
};

const getServiceAccountFromBase64 = (): ServiceAccountShape | null => {
  if (!config.firebaseServiceAccountBase64) {
    return null;
  }

  return JSON.parse(Buffer.from(config.firebaseServiceAccountBase64, 'base64').toString('utf-8')) as ServiceAccountShape;
};

const getServiceAccountFromEnv = (): ServiceAccountShape | null => {
  if (!config.firebaseProjectId || !config.firebaseClientEmail || !config.firebasePrivateKey) {
    return null;
  }

  return {
    project_id: config.firebaseProjectId,
    client_email: config.firebaseClientEmail,
    private_key: config.firebasePrivateKey.replace(/\\n/g, '\n'),
  };
};

const getServiceAccountFromFile = (): ServiceAccountShape => {
  const serviceAccountPath = resolveServiceAccountPath();

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Firebase service account file not found at ${serviceAccountPath}`);
  }

  return JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8')) as ServiceAccountShape;
};

const getFirebaseApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount =
    getServiceAccountFromBase64() ?? getServiceAccountFromEnv() ?? getServiceAccountFromFile();

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });
};

const firebaseApp = getFirebaseApp();
const firebaseAuth = admin.auth(firebaseApp);

export { firebaseApp, firebaseAuth };
