import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export async function getAllBooksFromLibrary(userId: string) {
  try {
    const libraryRef = collection(db, 'users', userId, 'library');
    const q = query(libraryRef);
    const querySnapshot = await getDocs(q);

    const books = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return books;
  } catch (error) {
    console.error('Error fetching all books from library:', error);
    throw error;
  }
}
