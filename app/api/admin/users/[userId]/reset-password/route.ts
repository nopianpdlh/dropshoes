import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash } from "bcrypt";

// POST /api/admin/users/[userId]/reset-password
export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return new NextResponse("Password is required", { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[USER_RESET_PASSWORD]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
