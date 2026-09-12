'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api, ApiResponseError } from '@/lib/api';
import { Item, CreateItemRequest, UpdateItemRequest } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/common/Modal';
import { StockBadge } from '@/components/common/Badge';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  Loader2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function AdminInventoryPage() {
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <AdminInventoryContent />
    </ProtectedRoute>
  );
}

function AdminInventoryContent() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateItemRequest>({
    title: '',
    isbn: '',
    author: '',
    category: '',
    totalCopies: 1,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.items.getAll({
        search: search.trim() || undefined,
        page,
        size: 10,
      });
      setItems(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      toastError('Error Loading Inventory', err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page, toastError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      isbn: '',
      author: '',
      category: 'Computer Science',
      totalCopies: 1,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: Item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      isbn: item.isbn,
      author: item.author,
      category: item.category,
      totalCopies: item.totalCopies,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await api.items.create(formData);
      toastSuccess('Item Created', `Successfully added '${formData.title}' to inventory.`);
      setIsAddModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toastError('Creation Failed', err.data?.message || err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setFormSubmitting(true);
    try {
      const updatePayload: UpdateItemRequest = {
        title: formData.title,
        author: formData.author,
        category: formData.category,
        totalCopies: Number(formData.totalCopies),
      };
      await api.items.update(selectedItem.id, updatePayload);
      toastSuccess('Item Updated', `Updated '${formData.title}' details.`);
      setIsEditModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toastError('Update Failed', err.data?.message || err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedItem) return;
    setFormSubmitting(true);
    try {
      await api.items.delete(selectedItem.id);
      toastSuccess('Item Deleted', `Removed '${selectedItem.title}' from catalog.`);
      setIsDeleteModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toastError('Deletion Prevented', err.data?.message || err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-purple-400" />
            Inventory & Catalog Control
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage library titles, adjust stock allocations, and track real-time availability. Total registered titles:{' '}
            <span className="text-purple-400 font-semibold">{totalElements}</span>
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Book
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search titles, authors, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm glass-input"
          />
        </div>
        <button
          onClick={fetchItems}
          className="p-2.5 rounded-xl glass-panel text-slate-400 hover:text-white transition-colors"
          title="Refresh table"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Title & Author</th>
                <th className="py-3.5 px-4">ISBN</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Total Copies</th>
                <th className="py-3.5 px-4 text-center">Available</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
                    Loading inventory records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.author}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{item.isbn}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-200">{item.totalCopies}</td>
                    <td className="py-3.5 px-4 text-center">
                      <StockBadge available={item.availableCopies} total={item.totalCopies} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {page + 1} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 rounded-lg glass-panel disabled:opacity-40 hover:text-white transition-all"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg glass-panel disabled:opacity-40 hover:text-white transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Library Item"
        description="Fill in the metadata to register a new book in the inventory."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Book Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Designing Data-Intensive Applications"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">ISBN</label>
              <input
                type="text"
                required
                placeholder="e.g. 978-1449373320"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm glass-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Author</label>
              <input
                type="text"
                required
                placeholder="e.g. Martin Kleppmann"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <input
                type="text"
                required
                placeholder="e.g. Database Systems"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm glass-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Total Copies</label>
              <input
                type="number"
                min={1}
                required
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 rounded-xl text-sm glass-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center gap-1.5"
            >
              {formSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Save Book
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT ITEM MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Inventory Details"
        description="Update book information or total copy count."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Book Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-sm glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Author</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm glass-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm glass-input"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Total Copies (Current Available: {selectedItem?.availableCopies})</label>
            <input
              type="number"
              min={1}
              required
              value={formData.totalCopies}
              onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
              className="w-full px-3.5 py-2 rounded-xl text-sm glass-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center gap-1.5"
            >
              {formSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Update Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        description="Are you sure you want to permanently remove this title from the library inventory?"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Notice on Active Loans:</p>
              <p className="mt-1">
                If there are copies currently checked out by members, the backend will reject this action with an error.
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-200">
            Item: <span className="font-bold text-white">&apos;{selectedItem?.title}&apos;</span> (ISBN: {selectedItem?.isbn})
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all flex items-center gap-1.5"
            >
              {formSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
