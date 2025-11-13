const { MongoClient } = require('mongodb');

async function insertBooks() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        console.log("Connecting to MongoDB...");
        await client.connect();
        console.log("Connected successfully!");

        const database = client.db("plp_bookstore");
        const books = database.collection("books");

        // Clear any existing data
        await books.deleteMany({});

        // Sample book data
        const bookData = [
            {
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                genre: "Classic",
                published_year: 1925,
                price: 12.99,
                in_stock: true,
                pages: 180,
                publisher: "Scribner"
            },
            {
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                genre: "Fiction",
                published_year: 1960,
                price: 14.99,
                in_stock: true,
                pages: 281,
                publisher: "J.B. Lippincott & Co."
            },
            {
                title: "1984",
                author: "George Orwell",
                genre: "Dystopian",
                published_year: 1949,
                price: 10.99,
                in_stock: false,
                pages: 328,
                publisher: "Secker & Warburg"
            },
            {
                title: "The Hobbit",
                author: "J.R.R. Tolkien",
                genre: "Fantasy",
                published_year: 1937,
                price: 16.99,
                in_stock: true,
                pages: 310,
                publisher: "George Allen & Unwin"
            },
            {
                title: "Harry Potter and the Philosopher's Stone",
                author: "J.K. Rowling",
                genre: "Fantasy",
                published_year: 1997,
                price: 19.99,
                in_stock: true,
                pages: 223,
                publisher: "Bloomsbury"
            },
            {
                title: "The Da Vinci Code",
                author: "Dan Brown",
                genre: "Mystery",
                published_year: 2003,
                price: 15.99,
                in_stock: false,
                pages: 489,
                publisher: "Doubleday"
            },
            {
                title: "The Alchemist",
                author: "Paulo Coelho",
                genre: "Fiction",
                published_year: 1988,
                price: 13.99,
                in_stock: true,
                pages: 208,
                publisher: "HarperTorch"
            },
            {
                title: "The Hunger Games",
                author: "Suzanne Collins",
                genre: "Dystopian",
                published_year: 2008,
                price: 17.99,
                in_stock: true,
                pages: 374,
                publisher: "Scholastic"
            },
            {
                title: "Dune",
                author: "Frank Herbert",
                genre: "Science Fiction",
                published_year: 1965,
                price: 14.99,
                in_stock: true,
                pages: 412,
                publisher: "Chilton Books"
            },
            {
                title: "The Martian",
                author: "Andy Weir",
                genre: "Science Fiction",
                published_year: 2011,
                price: 18.99,
                in_stock: true,
                pages: 369,
                publisher: "Crown"
            }
        ];

        const result = await books.insertMany(bookData);
        console.log(`${result.insertedCount} books inserted successfully!`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.close();
        console.log("Connection closed");
    }
}

insertBooks();