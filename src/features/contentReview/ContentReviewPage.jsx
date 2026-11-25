import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Drawer from "@/components/ui/Drawer";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Tabs from "@/components/ui/Tabs";
import Textarea from "@/components/ui/Textarea";
import { SkeletonText } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/authStore";
import {
  approveContentReview,
  cancelContentReview,
  fetchContentReviewDetail,
  fetchContentReviews,
  rejectContentReview,
} from "./contentReviewApi";
import ClassReviewsPanel from "./ClassReviewsPanel";
import { PENDING_COUNT_KEY } from "./usePendingReviewCount";

const RESOURCE_LABEL = {
  COURSE: "Khoá học",
  LESSON: "Bài giảng",
  GRAMMAR_LESSON: "Ngữ pháp",
  READING_PASSAGE: "Bài đọc",
  LISTENING_LESSON: "Bài nghe",
  PRONUNCIATION_LESSON: "Phát âm",
  WORD: "Từ vựng",
  TOPIC: "Chủ đề",
  EXAM: "Đề thi",
  AI_CONTENT: "Nội dung AI",
};

const ACTION_META = {
  CREATE: { label: "Thêm mới", tone: "info" },
  UPDATE: { label: "Chỉnh sửa", tone: "warning" },
  PUBLISH: { label: "Xuất bản / ẩn", tone: "warning" },
  RESTORE: { label: "Khôi phục", tone: "info" },
  IMPORT: { label: "Nhập hàng loạt", tone: "info" },
  DELETE: { label: "Xoá", tone: "danger" },
};

const STATUS_META = {
  PENDING: { label: "Chờ duyệt", tone: "warning" },
  APPROVED: { label: "Đã duyệt", tone: "success" },
  REJECTED: { label: "Từ chối", tone: "danger" },
  SUPERSEDED: { label: "Đã thay bằng yêu cầu mới", tone: "neutral" },
  CANCELLED: { label: "Đã huỷ", tone: "neutral" },
};

const STATUS_TABS = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "ALL", label: "Tất cả" },
];

const timeAgo = (value) =>
  value
    ? formatDistanceToNow(new Date(value), { addSuffix: true, locale: vi })
    : "";

/** Hiển thị nội dung giáo viên gửi lên dạng bảng trường - giá trị. */
function PayloadView({ payload }) {
  if (payload === null || payload === undefined) {
    return (
      <p className="text-sm text-ink-muted">
        Không có nội dung kèm theo (ví dụ: yêu cầu xoá).
      </p>
    );
  }
  if (typeof payload !== "object")
    return <p className="text-sm text-ink">{String(payload)}</p>;
  const entries = Array.isArray(payload)
    ? payload.map((v, i) => [`#${i + 1}`, v])
    : Object.entries(payload);
  return (
    <dl className="divide-y divide-line rounded-lg border border-line">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-[140px_1fr] gap-3 px-3 py-2">
          <dt className="text-xs uppercase tracking-wide text-ink-muted break-words">
            {key}
          </dt>
          <dd className="text-sm text-ink whitespace-pre-wrap break-words">
            {value !== null && typeof value === "object"
              ? JSON.stringify(value, null, 2)
              : String(value ?? "")}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ContentReviewPage() {
  const role = String(useAuthStore((s) => s.user?.role) || "").toLowerCase();
  const isAdmin = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type") || "";
  const setType = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("type", value);
    else next.delete("type");
    setSearchParams(next, { replace: true });
    setPage(0);
  };
  const [area, setArea] = useState("content");
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  const listQuery = useQuery({
    queryKey: ["content-reviews", { status, type, page }],
    queryFn: () => fetchContentReviews({ status, type, page }),
  });
  const detailQuery = useQuery({
    queryKey: ["content-reviews", "detail", openId],
    queryFn: () => fetchContentReviewDetail(openId),
    enabled: Boolean(openId),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["content-reviews"] });
    queryClient.invalidateQueries({ queryKey: PENDING_COUNT_KEY });
  };
  const onError = (err) =>
    toast.error(err?.message || "Không xử lý được yêu cầu");

  const approve = useMutation({
    mutationFn: (id) => approveContentReview(id),
    onSuccess: () => {
      toast.success("Đã duyệt và áp dụng thay đổi");
      setOpenId(null);
      refresh();
    },
    onError,
  });
  const reject = useMutation({
    mutationFn: ({ id, text }) => rejectContentReview(id, text),
    onSuccess: () => {
      toast.success("Đã từ chối yêu cầu");
      setRejecting(null);
      setReason("");
      setOpenId(null);
      refresh();
    },
    onError,
  });
  const cancel = useMutation({
    mutationFn: (id) => cancelContentReview(id),
    onSuccess: () => {
      toast.success("Đã huỷ yêu cầu");
      setOpenId(null);
      refresh();
    },
    onError,
  });

  const items = listQuery.data?.items ?? [];
  const totalPages = listQuery.data?.totalPages ?? 0;
  const detail = detailQuery.data;

  return (
    <div className="flex flex-col gap-5 p-6">
      {isAdmin && (
        <div className="flex gap-2">
          {[
            ["content", "Học liệu"],
            ["classes", "Lớp học"],
          ].map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={area === value ? "primary" : "secondary"}
              onClick={() => setArea(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}

      {area === "classes" ? (
        <ClassReviewsPanel />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              tabs={STATUS_TABS}
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(0);
              }}
            />
            <Select
              size="sm"
              containerClassName="w-48"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: "", label: "Tất cả loại học liệu" },
                ...Object.entries(RESOURCE_LABEL).map(([value, label]) => ({ value, label })),
              ]}
            />
          </div>

          <Card className="p-0">
            {listQuery.isLoading ? (
              <div className="p-5">
                <SkeletonText lines={6} />
              </div>
            ) : listQuery.isError ? (
              <ErrorState error={listQuery.error} onRetry={listQuery.refetch} />
            ) : items.length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title={
                  status === "PENDING"
                    ? "Không có yêu cầu nào đang chờ duyệt"
                    : "Chưa có yêu cầu"
                }
              />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                    <th className="px-5 py-3 font-medium">Nội dung</th>
                    <th className="px-3 py-3 font-medium">Thao tác</th>
                    {isAdmin && (
                      <th className="px-3 py-3 font-medium">Giáo viên</th>
                    )}
                    <th className="px-3 py-3 font-medium">Cập nhật</th>
                    <th className="px-3 py-3 font-medium">Trạng thái</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => {
                    const action = ACTION_META[r.action] ?? {
                      label: r.action,
                      tone: "neutral",
                    };
                    const st = STATUS_META[r.status] ?? {
                      label: r.status,
                      tone: "neutral",
                    };
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-line last:border-0 hover:bg-canvas"
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">
                            {r.title ||
                              `${RESOURCE_LABEL[r.resourceType] ?? r.resourceType} #${r.resourceId ?? "mới"}`}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {RESOURCE_LABEL[r.resourceType] ?? r.resourceType}
                            {r.resourceId ? ` #${r.resourceId}` : ""}
                            {r.revision > 1
                              ? ` · đã sửa ${r.revision} lần`
                              : ""}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <Badge tone={action.tone}>{action.label}</Badge>
                        </td>
                        {isAdmin && (
                          <td className="px-3 py-3 text-ink">
                            {r.requestedByEmail || `#${r.requestedBy}`}
                          </td>
                        )}
                        <td className="px-3 py-3 text-ink-muted">
                          {timeAgo(r.updatedAt)}
                        </td>
                        <td className="px-3 py-3">
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setOpenId(r.id)}
                          >
                            {isAdmin && r.status === "PENDING"
                              ? "Xem và duyệt"
                              : "Xem"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-3 text-sm text-ink-muted">
              <span>
                Trang {page + 1}/{totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}

      <Drawer
        open={Boolean(openId)}
        onClose={() => setOpenId(null)}
        title="Chi tiết yêu cầu"
      >
        {detailQuery.isLoading ? (
          <SkeletonText lines={8} />
        ) : detailQuery.isError ? (
          <ErrorState error={detailQuery.error} onRetry={detailQuery.refetch} />
        ) : detail ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                tone={(ACTION_META[detail.action] ?? {}).tone ?? "neutral"}
              >
                {(ACTION_META[detail.action] ?? {}).label ?? detail.action}
              </Badge>
              <Badge
                tone={(STATUS_META[detail.status] ?? {}).tone ?? "neutral"}
              >
                {(STATUS_META[detail.status] ?? {}).label ?? detail.status}
              </Badge>
              <span className="text-sm text-ink-muted">
                {RESOURCE_LABEL[detail.resourceType] ?? detail.resourceType}
                {detail.resourceId ? ` #${detail.resourceId}` : ""}
              </span>
            </div>
            <div className="text-sm text-ink">
              <p>
                <span className="text-ink-muted">Giáo viên: </span>
                {detail.requestedByEmail || `#${detail.requestedBy}`}
              </p>
              <p>
                <span className="text-ink-muted">Gửi lần đầu: </span>
                {timeAgo(detail.createdAt)}
                {detail.revision > 1
                  ? ` · cập nhật lần ${detail.revision} ${timeAgo(detail.updatedAt)}`
                  : ""}
              </p>
              {detail.reviewNote && (
                <p>
                  <span className="text-ink-muted">Ghi chú duyệt: </span>
                  {detail.reviewNote}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-ink-muted">
                Nội dung gửi duyệt
              </p>
              <PayloadView payload={detail.payload} />
            </div>

            {detail.status === "PENDING" && (
              <div className="flex justify-end gap-2 border-t border-line pt-4">
                {isAdmin ? (
                  <>
                    <Button
                      variant="danger"
                      onClick={() => setRejecting(detail.id)}
                      disabled={approve.isPending}
                    >
                      Từ chối
                    </Button>
                    <Button
                      onClick={() => approve.mutate(detail.id)}
                      loading={approve.isPending}
                    >
                      Duyệt và áp dụng
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => cancel.mutate(detail.id)}
                    loading={cancel.isPending}
                  >
                    Huỷ yêu cầu
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      <Modal
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title="Từ chối yêu cầu"
      >
        <div className="flex flex-col gap-4">
          <Textarea
            label="Lý do từ chối"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Giáo viên sẽ thấy lý do này để chỉnh sửa và gửi lại"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              Đóng
            </Button>
            <Button
              variant="danger"
              disabled={!reason.trim()}
              loading={reject.isPending}
              onClick={() =>
                reject.mutate({ id: rejecting, text: reason.trim() })
              }
            >
              Từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ContentReviewPage;
