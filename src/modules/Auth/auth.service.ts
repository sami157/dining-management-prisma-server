import { prisma } from '../../lib/prisma';
import ApiError from '../../errors/ApiError';

type AuthRegisterPayload = {
  firebaseUid: string;
  name: string;
  email: string;
  mobile?: string;
  profileImage?: string;
};

const register = async (payload: AuthRegisterPayload) => {
  const { firebaseUid, name, email, mobile, profileImage } = payload;

  try {
    const user = await prisma.user.upsert({
      where: {
        firebaseUid,
      },
      create: {
        firebaseUid,
        name,
        email,
        mobile,
        profileImage,
        role: 'MEMBER',
        isActive: true,
      },
      update: {
        name,
        email,
        mobile,
        profileImage,
        isActive: true,
      },
    });

    return user;
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'User already exists with provided email or firebaseUid');
    }
    throw error;
  }
};

export const AuthService = {
  register,
};
