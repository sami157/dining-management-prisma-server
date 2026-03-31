import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

type ServiceAccountShape = {
  project_id: string;
  client_email: string;
  private_key: string;
};

const defaultServiceAccountPath = path.join(process.cwd(), 'admin-key.json');

const resolveServiceAccountPath = () => {
  return process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || defaultServiceAccountPath;
};

const getFirebaseApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountPath = resolveServiceAccountPath();

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Firebase service account file not found at ${serviceAccountPath}`);
  }

  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, 'utf-8'),
  ) as ServiceAccountShape;

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
