const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-with-secure-secret';

async function registerUser(data) {
  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullname: data.fullname,
      email: data.email,
      password: hashed,
      role: data.role,
      phone_number: data.phone_number,
      gender: data.gender,
      date_of_birth: data.date_of_birth,
      address: data.address,
      profile_photo: data.profile_photo,
      // create user as INACTIVE until email verification completes
      status: 'INACTIVE',
    },
    select: {
      password: false,
      user_id: true,
      fullname: true,
      email: true,
      role: true,
      phone_number: true,
      gender: true,
      date_of_birth: true,
      address: true,
      profile_photo: true,
      joined_at: true,
      status: true,
    },
  });

  return user;
}

async function authenticateUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid email or password');

  const payload = { userId: user.user_id, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  // remove password from user before returning
  const { password: _p, ...safeUser } = user;

  return { token, user: safeUser };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { user_id: id } });
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

module.exports = { registerUser, authenticateUser, getUserById };
