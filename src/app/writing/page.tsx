// src/app/writing/page.tsx
'use client';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, BookOpen, PenTool, Bookmark, Calculator, Brain } from 'lucide-react';
import { books, Book, Category } from '@/data/books';

// Map categories to icons
const getBookIcon = (category: Category) => {
  const size = 36;
  switch (category) {
    case 'math':
    case 'math-workbook':
    case 'calculus-ab':
    case 'calculus-bc':
      return <Calculator size={size} />;
    case 'english':
      return <PenTool size={size} />;
    case 'english-workbook':
      return <Bookmark size={size} />;
    case 'life-science':
    case 'physical-science':
    case 'earth-science':
    case 'ap-physics':
    case 'ap-biology':
    case 'ap-chemistry':
      return <Brain size={size} />;
    default:
      return <BookOpen size={size} />;
  }
};

const sections = [
  { title: 'SAT Guides', categories: ['math', 'english'] as Category[] },
  { title: 'Writing Workbooks', categories: ['english-workbook'] as Category[] },
  { title: 'Middle School Science', categories: ['life-science', 'physical-science', 'earth-science'] as Category[] },
  { title: 'AP Science', categories: ['ap-physics', 'ap-biology', 'ap-chemistry'] as Category[] },
  { title: 'AP Calculus', categories: ['calculus-ab', 'calculus-bc'] as Category[] },
];

export default function WritingPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [selected, setSelected] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (book: Book) => {
    setSelected(book);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="bg-gradient-to-br from-background-start to-background-end min-h-screen py-16 flex flex-col justify-center items-center">
      <div className="container">
        {sections.map(({ title, categories }) => {
          const items = books.filter(b => categories.includes(b.category));
          if (!items.length) return null;
          return (
            <section key={title} className="mb-12">
              <h2 className="section-title text-center">{title}</h2>
              <div className="cards flex justify-center flex-wrap">
                {items.map(book => (
                  <div
                    key={book.id}
                    className="book-card"
                    onClick={() => openModal(book)}
                    style={{
                      '--primary': book.colors.primary,
                      '--secondary': book.colors.secondary,
                    } as React.CSSProperties}
                  >
                    <div className="cover">
                      {getBookIcon(book.category)}
                      <h3 className="mt-2 text-center">{book.title}</h3>
                      <span className="meta">Edition {book.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {modalOpen && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>
              <X size={24} />
            </button>
            <h2 className="text-2xl font-serif text-center mb-4">{selected.title}</h2>
            <div className="prose mb-4">{selected.description}</div>
            {selected.link ? (
              <a
                href={selected.link}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
              >
                View Online
              </a>
            ) : (
              <span className="text-muted italic">Preview coming soon</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}