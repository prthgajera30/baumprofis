// Firebase mocks for testing
import { vi } from 'vitest'

// Mock Firebase Auth
const mockSignInWithEmailAndPassword = vi.fn()
const mockCreateUserWithEmailAndPassword = vi.fn()
const mockSignOut = vi.fn()
const mockSendPasswordResetEmail = vi.fn()
const mockOnAuthStateChanged = vi.fn()

const mockAuth = {
  currentUser: null,
}

// Mock Firebase Firestore
const mockAddDoc = vi.fn()
const mockUpdateDoc = vi.fn()
const mockDeleteDoc = vi.fn()
const mockDoc = vi.fn()
const mockCollection = vi.fn()
const mockGetDoc = vi.fn()
const mockGetDocs = vi.fn()
const mockQuery = vi.fn()
const mockWhere = vi.fn()
const mockOrderBy = vi.fn()
const mockLimit = vi.fn()
const mockOnSnapshot = vi.fn()
const mockTransaction = vi.fn()

const mockFirestore = {
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  onSnapshot: mockOnSnapshot,
  transaction: mockTransaction,
}

// Mock Firebase functions
const mockGetApps = vi.fn(() => [])
const mockInitializeApp = vi.fn()
const mockGetApp = vi.fn()

// Complete Firebase mock
export const mockFirebase = {
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
  auth: vi.fn(() => mockAuth),
  firestore: vi.fn(() => mockFirestore),
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  onAuthStateChanged: mockOnAuthStateChanged,
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  onSnapshot: mockOnSnapshot,
  transaction: mockTransaction,
}

// Mock the firebase module
vi.mock('firebase/app', () => mockFirebase)
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  onAuthStateChanged: mockOnAuthStateChanged,
  getAuth: vi.fn(() => mockAuth),
}))

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  onSnapshot: mockOnSnapshot,
  transaction: mockTransaction,
  getFirestore: vi.fn(() => mockFirestore),
}))
