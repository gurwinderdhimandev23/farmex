import { NextRequest } from "next/server";
import { NotificationService } from "@/server/modules/notifications/notification.service";
import { getAuthUser, successResponse, errorResponse } from "@/server/shared/http/next-response";

const notificationService = new NotificationService();

export async function PATCH(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    const result = await notificationService.markAllAsRead(authUser.sub);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
