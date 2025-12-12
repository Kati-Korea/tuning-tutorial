'use client';

import React, { useEffect, useState } from "react";
import { fetchFirestoreData } from "@/lib/firebase";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function FirestoreRenderer() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedData = await fetchFirestoreData("guides"); // Firestore 컬렉션 이름
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      {data.map(item => (
        <div key={item.id} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{item.title}</h2>
          <MarkdownRenderer content={item.content} />
        </div>
      ))}
    </div>
  );
}