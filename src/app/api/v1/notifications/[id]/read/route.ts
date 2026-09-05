import { NextRequest } from "next/server";
import { NotificationService } from "@/server/modules/notifications/notification.service";
import { getAuthUser, successResponse, errorResponse } from "@/server/shared/http/next-response";

const notificationService = new NotificationService();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    const { id } = await params;

    const result = await notificationService.markAsRead(id, authUser.sub);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
