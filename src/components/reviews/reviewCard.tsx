'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

const DataEntryCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState(600);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setIframeHeight(680);
      } else if (window.innerWidth <= 768) {
        setIframeHeight(650);
      } else {
        setIframeHeight(600);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  return (
    <>
      <Card
        className="w-full max-w-md p-6 rounded-2xl border border-muted/50 shadow-md bg-white hover:shadow-lg transition cursor-pointer"
        onClick={openModal}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openModal();
        }}
      >
        <CardContent className="flex flex-col gap-2 items-center text-center">
          <h3 className="text-xl font-semibold text-foreground">Leave a Review</h3>
          <p className="text-sm text-muted-foreground">
            Submit your thoughts quickly and securely through our form.
          </p>
          <Button variant="secondary" className="mt-4">Open Form</Button>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          <ScrollArea className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white/90 backdrop-blur-md rounded-xl p-6 border border-teal-300 overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-teal-800 hover:text-teal-600"
              onClick={closeModal}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-semibold text-center text-teal-700 mb-4">
              Submit Your Information
            </h2>
            <div className="relative min-h-[400px]">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                  <div className="text-sm text-gray-500 animate-pulse">
                    Loading form...
                  </div>
                </div>
              )}
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSe6J_HJcwKGy2I55b5tn58kxkUIXWI7z5kabyYjEi9DA9120g/viewform?embedded=true"
                onLoad={() => setIsLoading(false)}
                style={{
                  opacity: isLoading ? 0 : 1,
                  height: `${iframeHeight}px`,
                }}
                allowFullScreen
                title="Data Entry Form"
                className="w-full border-none transition-opacity duration-500 ease-in-out"
              ></iframe>
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">
              Your information is secure. All submissions are anonymous unless you choose to share your contact details.
            </p>
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default DataEntryCard;
