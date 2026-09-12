"use client";

import { StockBadge } from "@/components/common/Badge";
import { api } from "@/lib/api";
import { Item } from "@/types";
import { BookOpen, Filter, Library, RotateCcw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function CatalogPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = [
    "ALL",
    "Computer Science",
    "Software Engineering",
    "Science",
    "Security",
    "Database Systems",
    "Psychology",
    "Business",
  ];

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const categoryParam =
        selectedCategory !== "ALL" ? selectedCategory : undefined;
      const res = await api.items.getAll({
        search: search.trim() || undefined,
        category: categoryParam,
        page: 0,
        size: 50,
      });
      setItems(res.content || []);
    } catch (err) {
      console.error("Failed to load catalog items", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const totalCopiesInStock = items.reduce(
    (acc, curr) => acc + curr.availableCopies,
    0,
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 inline-flex items-center gap-1.5">
              <Library className="w-3 h-3" /> Live Inventory
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            Library Catalog Explorer
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Browse real-time book availability and stock synchronized with
            PostgreSQL.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input"
            />
          </div>
          <button
            onClick={fetchItems}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Refresh Catalog"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Bar & Stock Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-500/50"
                  : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing{" "}
          <span className="text-white font-semibold">{items.length}</span>{" "}
          titles (
          <span className="text-emerald-400 font-semibold">
            {totalCopiesInStock}
          </span>{" "}
          copies available)
        </div>
      </div>

      {/* Book Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="glass-card p-5 rounded-2xl animate-pulse h-52 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-5 bg-slate-700/50 rounded-md w-3/4"></div>
                <div className="h-4 bg-slate-800/50 rounded-md w-1/2"></div>
                <div className="h-4 bg-slate-800/40 rounded-md w-1/3"></div>
              </div>
              <div className="h-6 bg-slate-800/60 rounded-md w-2/5"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border-slate-800 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <p className="text-white font-bold text-base">
              No titles match your search criteria
            </p>
            <p className="text-slate-400 text-xs">
              Try adjusting your keywords or clearing the category filter.
            </p>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("ALL");
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 transition-all inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 border border-white/5 hover:border-indigo-500/30 transition-all hover:scale-[1.01]"
            >
              <div className="space-y-2.5">
                <div className="inline-block px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-slate-800/80 text-indigo-300 border border-indigo-500/20">
                  {item.category}
                </div>
                <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-xs font-medium">
                  By {item.author}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    ISBN: {item.isbn}
                  </span>
                  <StockBadge
                    available={item.availableCopies}
                    total={item.totalCopies}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
