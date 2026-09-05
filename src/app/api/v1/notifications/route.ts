import { NextRequest } from "next/server";
import { NotificationService } from "@/server/modules/notifications/notification.service";
import { getAuthUser, successResponse, errorResponse } from "@/server/shared/http/next-response";

const notificationService = new NotificationService();

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    const notifications = await notificationService.getMyNotifications(authUser.sub);
    return successResponse(notifications);
  } catch (error) {
    return errorResponse(error);
  }
}
