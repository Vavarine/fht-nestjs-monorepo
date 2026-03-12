import { CustomerGateway } from "@user-notifier/application/customer-gateway/customer-gateway";
import {
  NotifyVideoStatus,
  NotifyVideoStatusRequest,
} from "./notify-video-status";
import { NotificationService } from "@user-notifier/application/notification-service/notification-service";

describe("NotifyVideoStatus", () => {
  let notifyVideoStatus: NotifyVideoStatus;
  let notificationService: NotificationService;
  let customerGateway: CustomerGateway;

  const mockCustomer = {
    id: "user-123",
    name: "João Silva",
    email: "joao@example.com",
  };

  beforeEach(() => {
    notificationService = {
      send: jest.fn(),
    } as any;
    customerGateway = {
      getById: jest.fn().mockResolvedValue(mockCustomer),
    } as any;
    notifyVideoStatus = new NotifyVideoStatus(
      notificationService,
      customerGateway,
    );
  });

  describe("execute", () => {
    it("should call notificationService.send with correct request", async () => {
      const request: NotifyVideoStatusRequest = {
        userId: "user-123",
        videoProcessingJobId: "job-456",
        status: "completed",
        fileName: "processed-video.zip",
      };

      await notifyVideoStatus.execute(request);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: request.userId,
        userEmail: mockCustomer.email,
        userName: mockCustomer.name,
        videoProcessingJobId: request.videoProcessingJobId,
        status: request.status,
        fileName: request.fileName,
      });
      expect(notificationService.send).toHaveBeenCalledTimes(1);
    });

    it("should send notification without fileName", async () => {
      const request: NotifyVideoStatusRequest = {
        userId: "user-789",
        videoProcessingJobId: "job-012",
        status: "failed",
      };

      await notifyVideoStatus.execute(request);

      expect(notificationService.send).toHaveBeenCalledWith({
        userId: request.userId,
        userEmail: mockCustomer.email,
        userName: mockCustomer.name,
        videoProcessingJobId: request.videoProcessingJobId,
        status: request.status,
        fileName: undefined,
      });
    });

    it("should handle different status values", async () => {
      const statuses = ["pending", "processing", "completed", "failed"];

      for (const status of statuses) {
        const request: NotifyVideoStatusRequest = {
          userId: "user-123",
          videoProcessingJobId: "job-456",
          status,
        };

        await notifyVideoStatus.execute(request);

        expect(notificationService.send).toHaveBeenCalledWith({
          userId: request.userId,
          userEmail: mockCustomer.email,
          userName: mockCustomer.name,
          videoProcessingJobId: request.videoProcessingJobId,
          status,
          fileName: undefined,
        });
      }

      expect(notificationService.send).toHaveBeenCalledTimes(4);
    });
  });
});
