import { db } from '@/lib/firebase/firebase';
import { auth } from '@/lib/firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const addBookToLibrary = async (book: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not logged in');

  const userLibraryRef = doc(db, 'users', user.uid, 'library', book.fid);
  await setDoc(userLibraryRef, {
    id: book.fid,
  });
};