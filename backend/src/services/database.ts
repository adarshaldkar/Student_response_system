import mongoose from 'mongoose';

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const mongoUrl = process.env.MONGO_URL;
      if (!mongoUrl) {
        throw new Error('MONGO_URL environment variable not set');
      }

      const dbName = process.env.DB_NAME || 'teacher_feedback';
      
      await mongoose.connect(mongoUrl, {
        dbName: dbName
      });

      this.isConnected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    await mongoose.disconnect();
    this.isConnected = false;
    console.log('Disconnected from MongoDB');
  }
}

export const database = Database.getInstance();