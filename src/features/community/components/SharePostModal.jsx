import { useState } from 'react'
import { Check, Link2, Search, Send } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import toast from 'react-hot-toast'

export default function SharePostModal({
  open,
  onClose,
  post,
  conversations = [],
  onShare,
}) {
  const [selectedConvId, setSelectedConvId] = useState('')
  const [search, setSearch] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!post) return null

  const filteredConversations = conversations.filter((c) =>
    (c.participantName || c.name || '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/community#post-${post.id}`
    navigator.clipboard?.writeText(postUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Đã sao chép liên kết bài viết vào bộ nhớ tạm!')
  }

  const handleConfirmShare = async () => {
    if (!selectedConvId) return
    setIsSending(true)
    try {
      await onShare(selectedConvId, post)
      onClose()
      setSelectedConvId('')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chia sẻ bài viết"
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* Post Preview Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={post.authorAvatar}
              name={post.authorName}
              size="sm"
            />
            <div>
              <p className="font-bold text-slate-800">{post.authorName}</p>
              <p className="text-[10px] text-slate-400">{post.authorRole || 'Tác giả'}</p>
            </div>
          </div>
          <p className="text-slate-600 line-clamp-2 italic leading-relaxed">
            "{post.content}"
          </p>
          {post.mediaUrl && (
            <img
              src={post.mediaUrl}
              alt="Media"
              className="h-28 w-full object-cover rounded-lg border border-slate-200"
            />
          )}
        </div>

        {/* Quick Action: Copy Link */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs text-slate-600 truncate mr-2">
            <Link2 size={15} className="text-brand-600 shrink-0" />
            <span className="truncate text-slate-500 font-mono text-[11px]">
              {window.location.origin}/community#post-{post.id}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 border border-brand-200 hover:bg-brand-50 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Link2 size={12} />}
            <span>{copied ? 'Đã chép' : 'Sao chép link'}</span>
          </button>
        </div>

        {/* Search Conversation */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Hoặc gửi vào cuộc trò chuyện / nhóm chat:
          </label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên bạn bè hoặc nhóm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="max-h-56 overflow-y-auto space-y-1 border border-slate-100 rounded-xl p-1 bg-white">
          {filteredConversations.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              Không tìm thấy cuộc trò chuyện phù hợp.
            </p>
          ) : (
            filteredConversations.map((conv) => {
              const name = conv.participantName || conv.name
              const avatar = conv.participantAvatar || conv.avatar
              const isSelected = selectedConvId === conv.id

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-navy-50 border border-navy-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar src={avatar} name={name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-800">{name}</p>
                      <p className="truncate text-[11px] text-slate-400">
                        {conv.type === 'group' || conv.type === 'GROUP' ? 'Nhóm trò chuyện' : 'Trò chuyện trực tiếp'}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-700 text-white shrink-0">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedConvId || isSending}
            onClick={handleConfirmShare}
            className="gap-1.5"
          >
            <Send size={13} />
            {isSending ? 'Đang gửi...' : 'Gửi bài viết'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
