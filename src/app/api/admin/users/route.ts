import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi, adminUnauthorized } from "@/lib/adminApiAuth";
import { getAdminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await assertAdminApi(req))) {
    return adminUnauthorized();
  }

  const app = getAdminApp();

  if (!app) {
    // Demo/development fallback
    const mockUsers = [
      {
        uid: "admin-1",
        email: "admin@sevasansaar.in",
        displayName: "Mohit Raj (Admin)",
        disabled: false,
        createdAt: "2024-01-10T12:00:00Z",
      },
      {
        uid: "admin-2",
        email: "tanya@sevasansaar.in",
        displayName: "Tanya Singh",
        disabled: false,
        createdAt: "2024-01-12T09:30:00Z",
      },
      {
        uid: "user-1",
        email: "sunita.devi@gmail.com",
        displayName: "Sunita Devi (Provider)",
        disabled: false,
        createdAt: "2024-02-01T10:15:00Z",
      },
      {
        uid: "user-2",
        email: "imran.khan@outlook.com",
        displayName: "Imran Khan",
        disabled: false,
        createdAt: "2024-02-05T14:20:00Z",
      },
      {
        uid: "user-3",
        email: "meera.iyer@yahoo.com",
        displayName: "Meera Iyer",
        disabled: true,
        createdAt: "2024-02-10T11:00:00Z",
      },
    ];

    return NextResponse.json({
      users: mockUsers,
      note: "Live demo mode: Displaying simulated users",
    });
  }

  try {
    // Firebase Admin Auth is accessed through the initialized Admin app.
    const auth = app.auth();

    const list = await auth.listUsers(200);

    const users = list.users.map((user) => ({
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      disabled: user.disabled,
      createdAt: user.metadata.creationTime ?? null,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);

    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 }
    );
  }
}