"""
Curated demo dataset of ~150 popular movies.
Used when the full Kaggle dataset isn't available.
Each entry: id, title, year, genres, cast, director, keywords, overview, vote_average, tmdb_id
"""

DEMO_MOVIES = [
    {
        "id": 1, "title": "The Dark Knight", "year": 2008,
        "genres": ["Action", "Crime", "Drama"],
        "cast": ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
        "director": "Christopher Nolan",
        "keywords": ["superhero", "batman", "joker", "corruption", "gotham"],
        "overview": "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
        "vote_average": 9.0, "tmdb_id": 155
    },
    {
        "id": 2, "title": "Inception", "year": 2010,
        "genres": ["Action", "Science Fiction", "Thriller"],
        "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
        "director": "Christopher Nolan",
        "keywords": ["dream", "heist", "subconscious", "mind", "reality"],
        "overview": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
        "vote_average": 8.8, "tmdb_id": 27205
    },
    {
        "id": 3, "title": "Interstellar", "year": 2014,
        "genres": ["Adventure", "Drama", "Science Fiction"],
        "cast": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        "director": "Christopher Nolan",
        "keywords": ["space", "black hole", "time", "wormhole", "future"],
        "overview": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        "vote_average": 8.6, "tmdb_id": 157336
    },
    {
        "id": 4, "title": "The Matrix", "year": 1999,
        "genres": ["Action", "Science Fiction"],
        "cast": ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
        "director": "Lana Wachowski",
        "keywords": ["virtual reality", "simulation", "hacker", "dystopia", "ai"],
        "overview": "A hacker learns that his entire life has been a simulation created by machines, and joins a rebellion to overthrow them.",
        "vote_average": 8.7, "tmdb_id": 603
    },
    {
        "id": 5, "title": "Pulp Fiction", "year": 1994,
        "genres": ["Crime", "Drama", "Thriller"],
        "cast": ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
        "director": "Quentin Tarantino",
        "keywords": ["nonlinear", "hitman", "crime", "violence", "dialogue"],
        "overview": "The lives of two mob hitmen, a boxer, a gangster, and his wife intertwine in four tales of violence and redemption.",
        "vote_average": 8.9, "tmdb_id": 680
    },
    {
        "id": 6, "title": "Fight Club", "year": 1999,
        "genres": ["Drama", "Thriller"],
        "cast": ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
        "director": "David Fincher",
        "keywords": ["identity", "consumerism", "underground", "anarchy", "twist"],
        "overview": "An insomniac office worker forms an underground fight club with a soap salesman.",
        "vote_average": 8.8, "tmdb_id": 550
    },
    {
        "id": 7, "title": "Forrest Gump", "year": 1994,
        "genres": ["Comedy", "Drama", "Romance"],
        "cast": ["Tom Hanks", "Robin Wright", "Gary Sinise"],
        "director": "Robert Zemeckis",
        "keywords": ["history", "life", "love", "inspirational", "vietnam"],
        "overview": "The presidencies of Kennedy and Johnson through the eyes of an Alabama man who witnesses events firsthand.",
        "vote_average": 8.8, "tmdb_id": 13
    },
    {
        "id": 8, "title": "The Shawshank Redemption", "year": 1994,
        "genres": ["Drama", "Crime"],
        "cast": ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
        "director": "Frank Darabont",
        "keywords": ["prison", "hope", "friendship", "redemption", "escape"],
        "overview": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        "vote_average": 9.3, "tmdb_id": 278
    },
    {
        "id": 9, "title": "Goodfellas", "year": 1990,
        "genres": ["Crime", "Drama"],
        "cast": ["Ray Liotta", "Robert De Niro", "Joe Pesci"],
        "director": "Martin Scorsese",
        "keywords": ["mafia", "mob", "crime", "rise and fall", "organized crime"],
        "overview": "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.",
        "vote_average": 8.7, "tmdb_id": 769
    },
    {
        "id": 10, "title": "The Godfather", "year": 1972,
        "genres": ["Crime", "Drama"],
        "cast": ["Marlon Brando", "Al Pacino", "James Caan"],
        "director": "Francis Ford Coppola",
        "keywords": ["mafia", "power", "family", "crime", "succession"],
        "overview": "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.",
        "vote_average": 9.2, "tmdb_id": 238
    },
    {
        "id": 11, "title": "Schindler's List", "year": 1993,
        "genres": ["Drama", "History", "War"],
        "cast": ["Liam Neeson", "Ralph Fiennes", "Ben Kingsley"],
        "director": "Steven Spielberg",
        "keywords": ["holocaust", "war", "survival", "humanity", "nazi"],
        "overview": "In German-occupied Poland during World War II, industrialist Oskar Schindler saves over a thousand Jewish lives.",
        "vote_average": 9.0, "tmdb_id": 424
    },
    {
        "id": 12, "title": "The Silence of the Lambs", "year": 1991,
        "genres": ["Crime", "Drama", "Thriller"],
        "cast": ["Jodie Foster", "Anthony Hopkins", "Scott Glenn"],
        "director": "Jonathan Demme",
        "keywords": ["serial killer", "fbi", "psychological", "cannibal", "thriller"],
        "overview": "A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to catch another serial killer.",
        "vote_average": 8.6, "tmdb_id": 274
    },
    {
        "id": 13, "title": "Gladiator", "year": 2000,
        "genres": ["Action", "Drama", "Adventure"],
        "cast": ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen"],
        "director": "Ridley Scott",
        "keywords": ["rome", "gladiator", "revenge", "warrior", "ancient"],
        "overview": "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family.",
        "vote_average": 8.5, "tmdb_id": 98
    },
    {
        "id": 14, "title": "The Lord of the Rings: The Fellowship of the Ring", "year": 2001,
        "genres": ["Adventure", "Fantasy", "Action"],
        "cast": ["Elijah Wood", "Ian McKellen", "Orlando Bloom"],
        "director": "Peter Jackson",
        "keywords": ["fantasy", "ring", "quest", "evil", "magic"],
        "overview": "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring.",
        "vote_average": 8.8, "tmdb_id": 120
    },
    {
        "id": 15, "title": "The Lord of the Rings: The Return of the King", "year": 2003,
        "genres": ["Adventure", "Fantasy", "Action"],
        "cast": ["Elijah Wood", "Viggo Mortensen", "Ian McKellen"],
        "director": "Peter Jackson",
        "keywords": ["fantasy", "battle", "quest", "evil defeated", "epic"],
        "overview": "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo.",
        "vote_average": 9.0, "tmdb_id": 122
    },
    {
        "id": 16, "title": "Star Wars: A New Hope", "year": 1977,
        "genres": ["Action", "Adventure", "Science Fiction"],
        "cast": ["Mark Hamill", "Harrison Ford", "Carrie Fisher"],
        "director": "George Lucas",
        "keywords": ["space", "jedi", "force", "empire", "rebellion"],
        "overview": "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, and two droids to save the galaxy from the Empire.",
        "vote_average": 8.6, "tmdb_id": 11
    },
    {
        "id": 17, "title": "The Empire Strikes Back", "year": 1980,
        "genres": ["Action", "Adventure", "Science Fiction"],
        "cast": ["Mark Hamill", "Harrison Ford", "Carrie Fisher"],
        "director": "Irvin Kershner",
        "keywords": ["space", "jedi", "darth vader", "force", "galaxy"],
        "overview": "After the Rebels are brutally overpowered by the Empire, Luke Skywalker begins Jedi training with Yoda.",
        "vote_average": 8.7, "tmdb_id": 1891
    },
    {
        "id": 18, "title": "Avengers: Infinity War", "year": 2018,
        "genres": ["Action", "Adventure", "Science Fiction"],
        "cast": ["Robert Downey Jr.", "Chris Evans", "Josh Brolin"],
        "director": "Anthony Russo",
        "keywords": ["superhero", "thanos", "infinity stones", "marvel", "avengers"],
        "overview": "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos.",
        "vote_average": 8.4, "tmdb_id": 299536
    },
    {
        "id": 19, "title": "Avengers: Endgame", "year": 2019,
        "genres": ["Action", "Adventure", "Science Fiction"],
        "cast": ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo"],
        "director": "Anthony Russo",
        "keywords": ["superhero", "time travel", "marvel", "avengers", "sacrifice"],
        "overview": "After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos's actions.",
        "vote_average": 8.4, "tmdb_id": 299534
    },
    {
        "id": 20, "title": "Iron Man", "year": 2008,
        "genres": ["Action", "Adventure", "Science Fiction"],
        "cast": ["Robert Downey Jr.", "Gwyneth Paltrow", "Jeff Bridges"],
        "director": "Jon Favreau",
        "keywords": ["superhero", "iron man", "armor", "billionaire", "marvel"],
        "overview": "After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor.",
        "vote_average": 7.9, "tmdb_id": 1726
    },
    {
        "id": 21, "title": "Spider-Man: Into the Spider-Verse", "year": 2018,
        "genres": ["Animation", "Action", "Adventure"],
        "cast": ["Shameik Moore", "Jake Johnson", "Hailee Steinfeld"],
        "director": "Bob Persichetti",
        "keywords": ["spider-man", "multiverse", "animation", "superhero", "teen"],
        "overview": "Miles Morales becomes the Spider-Man of his reality and crosses paths with his counterparts from other dimensions.",
        "vote_average": 8.4, "tmdb_id": 324857
    },
    {
        "id": 22, "title": "The Lion King", "year": 1994,
        "genres": ["Animation", "Family", "Drama"],
        "cast": ["Matthew Broderick", "James Earl Jones", "Jeremy Irons"],
        "director": "Roger Allers",
        "keywords": ["lion", "africa", "destiny", "family", "betrayal"],
        "overview": "Lion cub Simba idolizes his father, King Mufasa, and takes to heart his own royal destiny.",
        "vote_average": 8.5, "tmdb_id": 8587
    },
    {
        "id": 23, "title": "Toy Story", "year": 1995,
        "genres": ["Animation", "Adventure", "Comedy"],
        "cast": ["Tom Hanks", "Tim Allen", "Don Rickles"],
        "director": "John Lasseter",
        "keywords": ["toys", "friendship", "adventure", "animation", "pixar"],
        "overview": "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy's room.",
        "vote_average": 8.3, "tmdb_id": 862
    },
    {
        "id": 24, "title": "Up", "year": 2009,
        "genres": ["Animation", "Adventure", "Comedy"],
        "cast": ["Edward Asner", "Jordan Nagai", "John Ratzenberger"],
        "director": "Pete Docter",
        "keywords": ["adventure", "balloon", "old man", "friendship", "paradise falls"],
        "overview": "78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons.",
        "vote_average": 8.3, "tmdb_id": 14160
    },
    {
        "id": 25, "title": "WALL-E", "year": 2008,
        "genres": ["Animation", "Family", "Science Fiction"],
        "cast": ["Ben Burtt", "Elissa Knight", "Jeff Garlin"],
        "director": "Andrew Stanton",
        "keywords": ["robot", "space", "love", "future", "earth"],
        "overview": "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey.",
        "vote_average": 8.4, "tmdb_id": 10681
    },
    {
        "id": 26, "title": "Spirited Away", "year": 2001,
        "genres": ["Animation", "Family", "Fantasy"],
        "cast": ["Daveigh Chase", "Suzanne Pleshette", "Miyu Irino"],
        "director": "Hayao Miyazaki",
        "keywords": ["spirits", "japan", "magic", "fantasy", "coming of age"],
        "overview": "A young girl wanders into a world ruled by gods, witches, and spirits and her parents are turned into pigs.",
        "vote_average": 8.5, "tmdb_id": 129
    },
    {
        "id": 27, "title": "Princess Mononoke", "year": 1997,
        "genres": ["Animation", "Fantasy", "Action"],
        "cast": ["Yoji Matsuda", "Yuriko Ishida", "Yuko Tanaka"],
        "director": "Hayao Miyazaki",
        "keywords": ["nature", "spirits", "war", "japan", "environment"],
        "overview": "On a journey to find the cure for a Tatarigami's curse, Ashitaka finds himself in the middle of a war between the forest gods and Tatara.",
        "vote_average": 8.4, "tmdb_id": 128
    },
    {
        "id": 28, "title": "Parasite", "year": 2019,
        "genres": ["Drama", "Thriller", "Comedy"],
        "cast": ["Kang-ho Song", "Sun-kyun Lee", "Cho Yeo-jeong"],
        "director": "Bong Joon-ho",
        "keywords": ["class", "inequality", "deception", "family", "korea"],
        "overview": "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        "vote_average": 8.5, "tmdb_id": 496243
    },
    {
        "id": 29, "title": "Oldboy", "year": 2003,
        "genres": ["Mystery", "Thriller", "Drama"],
        "cast": ["Choi Min-sik", "Yoo Ji-tae", "Kang Hye-jung"],
        "director": "Park Chan-wook",
        "keywords": ["revenge", "mystery", "twist", "korea", "imprisoned"],
        "overview": "After being kidnapped and imprisoned for fifteen years, Oh Dae-Su is released into a strange world.",
        "vote_average": 8.4, "tmdb_id": 670
    },
    {
        "id": 30, "title": "City of God", "year": 2002,
        "genres": ["Crime", "Drama"],
        "cast": ["Alexandre Rodrigues", "Leandro Firmino", "Phellipe Haagensen"],
        "director": "Fernando Meirelles",
        "keywords": ["brazil", "favela", "crime", "violence", "coming of age"],
        "overview": "In the slums of Rio de Janeiro in the 1970s, two boys growing up choose different paths: one becomes a photographer, the other a drug dealer.",
        "vote_average": 8.6, "tmdb_id": 598
    },
    {
        "id": 31, "title": "Whiplash", "year": 2014,
        "genres": ["Drama", "Music"],
        "cast": ["Miles Teller", "J.K. Simmons", "Melissa Benoist"],
        "director": "Damien Chazelle",
        "keywords": ["music", "drumming", "obsession", "ambition", "jazz"],
        "overview": "A promising young drummer enrolls at a cutthroat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing.",
        "vote_average": 8.5, "tmdb_id": 244786
    },
    {
        "id": 32, "title": "La La Land", "year": 2016,
        "genres": ["Comedy", "Drama", "Music"],
        "cast": ["Ryan Gosling", "Emma Stone", "John Legend"],
        "director": "Damien Chazelle",
        "keywords": ["jazz", "dreams", "romance", "los angeles", "musical"],
        "overview": "A jazz pianist falls for an aspiring actress in Los Angeles.",
        "vote_average": 8.0, "tmdb_id": 313369
    },
    {
        "id": 33, "title": "The Grand Budapest Hotel", "year": 2014,
        "genres": ["Comedy", "Drama"],
        "cast": ["Ralph Fiennes", "Tony Revolori", "Saoirse Ronan"],
        "director": "Wes Anderson",
        "keywords": ["hotel", "europe", "quirky", "comedy", "theft"],
        "overview": "A writer encounters the owner of an aging high-class hotel and finds out about his adventures with his lobby boy.",
        "vote_average": 8.1, "tmdb_id": 120467
    },
    {
        "id": 34, "title": "Moonrise Kingdom", "year": 2012,
        "genres": ["Comedy", "Drama", "Romance"],
        "cast": ["Jared Gilman", "Kara Hayward", "Bruce Willis"],
        "director": "Wes Anderson",
        "keywords": ["love", "children", "island", "quirky", "adventure"],
        "overview": "A pair of young lovers flee their New England town, which causes a local search party to fan out to find them.",
        "vote_average": 7.8, "tmdb_id": 83666
    },
    {
        "id": 35, "title": "No Country for Old Men", "year": 2007,
        "genres": ["Crime", "Drama", "Thriller"],
        "cast": ["Tommy Lee Jones", "Javier Bardem", "Josh Brolin"],
        "director": "Joel Coen",
        "keywords": ["violence", "texas", "drug money", "hitman", "fate"],
        "overview": "A hunter stumbles upon drug money and is relentlessly pursued by a psychopathic killer.",
        "vote_average": 8.1, "tmdb_id": 6977
    },
    {
        "id": 36, "title": "Fargo", "year": 1996,
        "genres": ["Crime", "Drama", "Thriller"],
        "cast": ["Frances McDormand", "William H. Macy", "Steve Buscemi"],
        "director": "Joel Coen",
        "keywords": ["crime", "minnesota", "kidnapping", "dark comedy", "murder"],
        "overview": "A car salesman hires two criminals to kidnap his wife for ransom. A pregnant police chief investigates the ensuing murders.",
        "vote_average": 8.1, "tmdb_id": 275
    },
    {
        "id": 37, "title": "The Big Lebowski", "year": 1998,
        "genres": ["Comedy", "Crime"],
        "cast": ["Jeff Bridges", "John Goodman", "Julianne Moore"],
        "director": "Joel Coen",
        "keywords": ["bowling", "california", "cult", "mistaken identity", "slacker"],
        "overview": "When The Dude's rug is ruined, he demands compensation — leading to a kidnapping scheme.",
        "vote_average": 8.1, "tmdb_id": 115
    },
    {
        "id": 38, "title": "Memento", "year": 2000,
        "genres": ["Mystery", "Thriller"],
        "cast": ["Guy Pearce", "Carrie-Anne Moss", "Joe Pantoliano"],
        "director": "Christopher Nolan",
        "keywords": ["memory", "nonlinear", "mystery", "tattoos", "revenge"],
        "overview": "A man with short-term memory loss attempts to track down his wife's murderer.",
        "vote_average": 8.4, "tmdb_id": 77
    },
    {
        "id": 39, "title": "Prestige", "year": 2006,
        "genres": ["Drama", "Mystery", "Science Fiction"],
        "cast": ["Christian Bale", "Hugh Jackman", "Scarlett Johansson"],
        "director": "Christopher Nolan",
        "keywords": ["magic", "rivalry", "obsession", "illusion", "twist"],
        "overview": "After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion.",
        "vote_average": 8.5, "tmdb_id": 1124
    },
    {
        "id": 40, "title": "Se7en", "year": 1995,
        "genres": ["Crime", "Mystery", "Thriller"],
        "cast": ["Brad Pitt", "Morgan Freeman", "Kevin Spacey"],
        "director": "David Fincher",
        "keywords": ["serial killer", "seven deadly sins", "detective", "dark", "crime"],
        "overview": "Two detectives hunt a serial killer who uses the seven deadly sins as his motives.",
        "vote_average": 8.6, "tmdb_id": 807
    },
    {
        "id": 41, "title": "Gone Girl", "year": 2014,
        "genres": ["Drama", "Mystery", "Thriller"],
        "cast": ["Ben Affleck", "Rosamund Pike", "Neil Patrick Harris"],
        "director": "David Fincher",
        "keywords": ["marriage", "mystery", "media", "twist", "disappearance"],
        "overview": "With his wife's disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him.",
        "vote_average": 8.1, "tmdb_id": 210577
    },
    {
        "id": 42, "title": "Zodiac", "year": 2007,
        "genres": ["Crime", "Drama", "Mystery"],
        "cast": ["Jake Gyllenhaal", "Mark Ruffalo", "Robert Downey Jr."],
        "director": "David Fincher",
        "keywords": ["serial killer", "zodiac", "investigation", "real events", "newspaper"],
        "overview": "A San Francisco cartoonist becomes an amateur detective obsessed with the Zodiac Killer.",
        "vote_average": 7.7, "tmdb_id": 11151
    },
    {
        "id": 43, "title": "Knives Out", "year": 2019,
        "genres": ["Crime", "Drama", "Mystery"],
        "cast": ["Daniel Craig", "Chris Evans", "Ana de Armas"],
        "director": "Rian Johnson",
        "keywords": ["mystery", "whodunit", "inheritance", "detective", "family"],
        "overview": "A detective investigates the death of a patriarch of an eccentric, combative family.",
        "vote_average": 7.9, "tmdb_id": 546554
    },
    {
        "id": 44, "title": "Get Out", "year": 2017,
        "genres": ["Horror", "Mystery", "Thriller"],
        "cast": ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford"],
        "director": "Jordan Peele",
        "keywords": ["racism", "horror", "social commentary", "hypnosis", "thriller"],
        "overview": "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness grows.",
        "vote_average": 7.7, "tmdb_id": 419430
    },
    {
        "id": 45, "title": "Us", "year": 2019,
        "genres": ["Horror", "Thriller"],
        "cast": ["Lupita Nyong'o", "Winston Duke", "Elisabeth Moss"],
        "director": "Jordan Peele",
        "keywords": ["doppelganger", "horror", "social commentary", "family", "clone"],
        "overview": "A family's summer vacation turns sinister when doppelgangers appear outside their home.",
        "vote_average": 7.2, "tmdb_id": 458156
    },
    {
        "id": 46, "title": "Hereditary", "year": 2018,
        "genres": ["Drama", "Horror", "Mystery"],
        "cast": ["Toni Collette", "Milly Shapiro", "Gabriel Byrne"],
        "director": "Ari Aster",
        "keywords": ["family", "grief", "occult", "dread", "supernatural"],
        "overview": "When the matriarch of the Graham family passes away, her daughter's family begins to unravel dark secrets.",
        "vote_average": 7.3, "tmdb_id": 493922
    },
    {
        "id": 47, "title": "Midsommar", "year": 2019,
        "genres": ["Drama", "Horror", "Mystery"],
        "cast": ["Florence Pugh", "Jack Reynor", "Vilhelm Blomgren"],
        "director": "Ari Aster",
        "keywords": ["cult", "sweden", "pagan", "relationship", "folk horror"],
        "overview": "A couple travels to Sweden to visit a midsummer festival that takes a sinister turn.",
        "vote_average": 7.1, "tmdb_id": 530385
    },
    {
        "id": 48, "title": "The Shining", "year": 1980,
        "genres": ["Drama", "Horror"],
        "cast": ["Jack Nicholson", "Shelley Duvall", "Scatman Crothers"],
        "director": "Stanley Kubrick",
        "keywords": ["hotel", "isolation", "supernatural", "madness", "writer"],
        "overview": "A family heads to an isolated hotel for the winter, where an evil presence influences the father into violence.",
        "vote_average": 8.4, "tmdb_id": 694
    },
    {
        "id": 49, "title": "2001: A Space Odyssey", "year": 1968,
        "genres": ["Science Fiction", "Mystery", "Adventure"],
        "cast": ["Keir Dullea", "Gary Lockwood", "William Sylvester"],
        "director": "Stanley Kubrick",
        "keywords": ["space", "ai", "evolution", "monolith", "existential"],
        "overview": "Humanity finds a mysterious object buried beneath the lunar surface and sets off to find its origin.",
        "vote_average": 8.3, "tmdb_id": 62
    },
    {
        "id": 50, "title": "A Clockwork Orange", "year": 1971,
        "genres": ["Crime", "Drama", "Science Fiction"],
        "cast": ["Malcolm McDowell", "Patrick Magee", "Michael Bates"],
        "director": "Stanley Kubrick",
        "keywords": ["violence", "dystopia", "free will", "conditioning", "future"],
        "overview": "In a dystopian Britain, a gang leader is jailed and volunteers for aversion therapy.",
        "vote_average": 8.3, "tmdb_id": 185
    },
    {
        "id": 51, "title": "Blade Runner 2049", "year": 2017,
        "genres": ["Drama", "Mystery", "Science Fiction"],
        "cast": ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
        "director": "Denis Villeneuve",
        "keywords": ["replicant", "dystopia", "detective", "future", "identity"],
        "overview": "A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.",
        "vote_average": 8.0, "tmdb_id": 335984
    },
    {
        "id": 52, "title": "Arrival", "year": 2016,
        "genres": ["Drama", "Mystery", "Science Fiction"],
        "cast": ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
        "director": "Denis Villeneuve",
        "keywords": ["alien", "language", "time", "linguistics", "first contact"],
        "overview": "When mysterious spacecraft touch down across the globe, a linguist is recruited by the military.",
        "vote_average": 7.9, "tmdb_id": 329865
    },
    {
        "id": 53, "title": "Dune", "year": 2021,
        "genres": ["Adventure", "Drama", "Science Fiction"],
        "cast": ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac"],
        "director": "Denis Villeneuve",
        "keywords": ["desert", "spice", "prophecy", "space opera", "politics"],
        "overview": "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with protecting the valuable spice.",
        "vote_average": 7.9, "tmdb_id": 438631
    },
    {
        "id": 54, "title": "Sicario", "year": 2015,
        "genres": ["Action", "Crime", "Drama"],
        "cast": ["Emily Blunt", "Benicio Del Toro", "Josh Brolin"],
        "director": "Denis Villeneuve",
        "keywords": ["cartel", "drug war", "mexico", "cia", "border"],
        "overview": "An idealistic FBI agent is enlisted by a government task force to aid in the escalating war against drugs.",
        "vote_average": 7.6, "tmdb_id": 273481
    },
    {
        "id": 55, "title": "Prisoners", "year": 2013,
        "genres": ["Crime", "Drama", "Mystery"],
        "cast": ["Hugh Jackman", "Jake Gyllenhaal", "Viola Davis"],
        "director": "Denis Villeneuve",
        "keywords": ["kidnapping", "detective", "father", "mystery", "morality"],
        "overview": "When Keller Dover's daughter and her friend go missing, he takes matters into his own hands as the police pursue leads.",
        "vote_average": 8.1, "tmdb_id": 146233
    },
    {
        "id": 56, "title": "The Social Network", "year": 2010,
        "genres": ["Drama", "History"],
        "cast": ["Jesse Eisenberg", "Andrew Garfield", "Justin Timberlake"],
        "director": "David Fincher",
        "keywords": ["facebook", "startup", "harvard", "betrayal", "tech"],
        "overview": "Harvard student Mark Zuckerberg creates the social networking site Facebook from his dorm room.",
        "vote_average": 7.7, "tmdb_id": 37799
    },
    {
        "id": 57, "title": "Moneyball", "year": 2011,
        "genres": ["Drama", "History", "Sport"],
        "cast": ["Brad Pitt", "Jonah Hill", "Philip Seymour Hoffman"],
        "director": "Bennett Miller",
        "keywords": ["baseball", "statistics", "sports", "underdog", "analytics"],
        "overview": "Oakland A's general manager Billy Beane attempts to assemble a competitive team on a lean budget.",
        "vote_average": 7.6, "tmdb_id": 60308
    },
    {
        "id": 58, "title": "The Revenant", "year": 2015,
        "genres": ["Adventure", "Drama", "Western"],
        "cast": ["Leonardo DiCaprio", "Tom Hardy", "Will Poulter"],
        "director": "Alejandro González Iñárritu",
        "keywords": ["survival", "nature", "revenge", "bear", "frontier"],
        "overview": "A frontiersman survives a brutal bear attack and seeks revenge against those who betrayed him.",
        "vote_average": 7.9, "tmdb_id": 281957
    },
    {
        "id": 59, "title": "Birdman", "year": 2014,
        "genres": ["Comedy", "Drama"],
        "cast": ["Michael Keaton", "Edward Norton", "Emma Stone"],
        "director": "Alejandro González Iñárritu",
        "keywords": ["superhero", "theater", "ego", "one take", "broadway"],
        "overview": "A washed-up superhero actor attempts to revive his career by writing and starring in a Broadway production.",
        "vote_average": 7.7, "tmdb_id": 194662
    },
    {
        "id": 60, "title": "12 Years a Slave", "year": 2013,
        "genres": ["Drama", "History"],
        "cast": ["Chiwetel Ejiofor", "Michael Fassbender", "Lupita Nyong'o"],
        "director": "Steve McQueen",
        "keywords": ["slavery", "racism", "survival", "history", "freedom"],
        "overview": "In the antebellum United States, Solomon Northup, a free black man from upstate New York, is abducted and sold into slavery.",
        "vote_average": 8.1, "tmdb_id": 76203
    },
    {
        "id": 61, "title": "Mad Max: Fury Road", "year": 2015,
        "genres": ["Action", "Adventure", "Science Fiction"],
        "cast": ["Tom Hardy", "Charlize Theron", "Nicholas Hoult"],
        "director": "George Miller",
        "keywords": ["post-apocalyptic", "desert", "car chase", "survival", "feminist"],
        "overview": "In a post-apocalyptic wasteland, Max teams up with Imperator Furiosa to flee from cult leader Immortan Joe.",
        "vote_average": 7.9, "tmdb_id": 76341
    },
    {
        "id": 62, "title": "John Wick", "year": 2014,
        "genres": ["Action", "Crime", "Thriller"],
        "cast": ["Keanu Reeves", "Michael Nyqvist", "Alfie Allen"],
        "director": "Chad Stahelski",
        "keywords": ["hitman", "revenge", "assassin", "dog", "action"],
        "overview": "An ex-hitman comes out of retirement to track down the gangsters that killed his dog and took his car.",
        "vote_average": 7.4, "tmdb_id": 245891
    },
    {
        "id": 63, "title": "Heat", "year": 1995,
        "genres": ["Action", "Crime", "Drama"],
        "cast": ["Al Pacino", "Robert De Niro", "Val Kilmer"],
        "director": "Michael Mann",
        "keywords": ["heist", "detective", "cop", "criminal", "los angeles"],
        "overview": "A veteran detective pits himself against a master criminal who has planned a final heist before retiring.",
        "vote_average": 8.0, "tmdb_id": 949
    },
    {
        "id": 64, "title": "Casino", "year": 1995,
        "genres": ["Crime", "Drama"],
        "cast": ["Robert De Niro", "Sharon Stone", "Joe Pesci"],
        "director": "Martin Scorsese",
        "keywords": ["las vegas", "mafia", "casino", "gambling", "corruption"],
        "overview": "Sam Rothstein is sent by the mob to oversee operations in Las Vegas, but his personal life and rise to power are threatened.",
        "vote_average": 8.2, "tmdb_id": 524
    },
    {
        "id": 65, "title": "The Departed", "year": 2006,
        "genres": ["Crime", "Drama", "Thriller"],
        "cast": ["Leonardo DiCaprio", "Matt Damon", "Jack Nicholson"],
        "director": "Martin Scorsese",
        "keywords": ["undercover", "mob", "boston", "mole", "betrayal"],
        "overview": "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang.",
        "vote_average": 8.5, "tmdb_id": 1422
    },
    {
        "id": 66, "title": "Wolf of Wall Street", "year": 2013,
        "genres": ["Comedy", "Crime", "Drama"],
        "cast": ["Leonardo DiCaprio", "Jonah Hill", "Margot Robbie"],
        "director": "Martin Scorsese",
        "keywords": ["wall street", "fraud", "excess", "finance", "debauchery"],
        "overview": "Based on the true story of Jordan Belfort, from his rise to a wealthy stockbroker to his fall involving crime and corruption.",
        "vote_average": 8.0, "tmdb_id": 106646
    },
    {
        "id": 67, "title": "Shutter Island", "year": 2010,
        "genres": ["Drama", "Mystery", "Thriller"],
        "cast": ["Leonardo DiCaprio", "Mark Ruffalo", "Ben Kingsley"],
        "director": "Martin Scorsese",
        "keywords": ["asylum", "mystery", "twist", "detective", "island"],
        "overview": "In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane.",
        "vote_average": 8.1, "tmdb_id": 11324
    },
    {
        "id": 68, "title": "Titanic", "year": 1997,
        "genres": ["Drama", "Romance"],
        "cast": ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane"],
        "director": "James Cameron",
        "keywords": ["ship", "romance", "tragedy", "class", "historic"],
        "overview": "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious doomed ship.",
        "vote_average": 7.9, "tmdb_id": 597
    },
    {
        "id": 69, "title": "Avatar", "year": 2009,
        "genres": ["Action", "Adventure", "Science Fiction"],
        "cast": ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
        "director": "James Cameron",
        "keywords": ["alien planet", "nature", "military", "corporation", "alien"],
        "overview": "A paraplegic marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting its people.",
        "vote_average": 7.5, "tmdb_id": 19995
    },
    {
        "id": 70, "title": "Jurassic Park", "year": 1993,
        "genres": ["Adventure", "Science Fiction", "Thriller"],
        "cast": ["Sam Neill", "Laura Dern", "Jeff Goldblum"],
        "director": "Steven Spielberg",
        "keywords": ["dinosaurs", "theme park", "genetics", "danger", "island"],
        "overview": "A pragmatic paleontologist visiting an almost-complete amusement park is tasked with protecting a couple of kids.",
        "vote_average": 8.1, "tmdb_id": 329
    },
    {
        "id": 71, "title": "Raiders of the Lost Ark", "year": 1981,
        "genres": ["Action", "Adventure"],
        "cast": ["Harrison Ford", "Karen Allen", "Paul Freeman"],
        "director": "Steven Spielberg",
        "keywords": ["archaeology", "nazis", "adventure", "ark", "treasure"],
        "overview": "Archaeologist and adventurer Indiana Jones is hired by the U.S. government to find the Ark of the Covenant.",
        "vote_average": 8.4, "tmdb_id": 85
    },
    {
        "id": 72, "title": "E.T. the Extra-Terrestrial", "year": 1982,
        "genres": ["Family", "Science Fiction"],
        "cast": ["Henry Thomas", "Drew Barrymore", "Peter Coyote"],
        "director": "Steven Spielberg",
        "keywords": ["alien", "friendship", "child", "bicycle", "home"],
        "overview": "A troubled child summons the courage to help a friendly alien escape Earth and return to his home world.",
        "vote_average": 7.9, "tmdb_id": 601
    },
    {
        "id": 73, "title": "Saving Private Ryan", "year": 1998,
        "genres": ["Drama", "History", "War"],
        "cast": ["Tom Hanks", "Tom Sizemore", "Edward Burns"],
        "director": "Steven Spielberg",
        "keywords": ["world war ii", "soldier", "mission", "war", "sacrifice"],
        "overview": "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper.",
        "vote_average": 8.6, "tmdb_id": 857
    },
    {
        "id": 74, "title": "1917", "year": 2019,
        "genres": ["Drama", "War", "Action"],
        "cast": ["George MacKay", "Dean-Charles Chapman", "Mark Strong"],
        "director": "Sam Mendes",
        "keywords": ["world war i", "mission", "one shot", "soldier", "france"],
        "overview": "April 6, 1917. As a regiment assembles to wage war deep in enemy territory, two soldiers are assigned a mission.",
        "vote_average": 8.3, "tmdb_id": 530915
    },
    {
        "id": 75, "title": "Dunkirk", "year": 2017,
        "genres": ["Action", "Drama", "History"],
        "cast": ["Fionn Whitehead", "Tom Glynn-Carney", "Jack Lowden"],
        "director": "Christopher Nolan",
        "keywords": ["war", "evacuation", "beach", "survival", "world war ii"],
        "overview": "Allied soldiers from Belgium, the British Empire, and France are surrounded by the German Army and evacuated from Dunkirk.",
        "vote_average": 7.9, "tmdb_id": 374720
    },
    {
        "id": 76, "title": "Oppenheimer", "year": 2023,
        "genres": ["Drama", "History", "Thriller"],
        "cast": ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
        "director": "Christopher Nolan",
        "keywords": ["atomic bomb", "manhattan project", "physics", "war", "moral dilemma"],
        "overview": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        "vote_average": 8.3, "tmdb_id": 872585
    },
    {
        "id": 77, "title": "Tenet", "year": 2020,
        "genres": ["Action", "Science Fiction", "Thriller"],
        "cast": ["John David Washington", "Robert Pattinson", "Elizabeth Debicki"],
        "director": "Christopher Nolan",
        "keywords": ["time inversion", "spy", "action", "paradox", "entropy"],
        "overview": "Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage.",
        "vote_average": 7.3, "tmdb_id": 577922
    },
    {
        "id": 78, "title": "Eternal Sunshine of the Spotless Mind", "year": 2004,
        "genres": ["Drama", "Romance", "Science Fiction"],
        "cast": ["Jim Carrey", "Kate Winslet", "Kirsten Dunst"],
        "director": "Michel Gondry",
        "keywords": ["memory", "love", "erasing", "relationship", "identity"],
        "overview": "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.",
        "vote_average": 8.3, "tmdb_id": 38
    },
    {
        "id": 79, "title": "Her", "year": 2013,
        "genres": ["Drama", "Romance", "Science Fiction"],
        "cast": ["Joaquin Phoenix", "Scarlett Johansson", "Amy Adams"],
        "director": "Spike Jonze",
        "keywords": ["ai", "love", "loneliness", "technology", "future"],
        "overview": "In a near future, a lonely writer develops an unlikely relationship with an operating system designed to meet his every need.",
        "vote_average": 8.0, "tmdb_id": 152601
    },
    {
        "id": 80, "title": "Ex Machina", "year": 2014,
        "genres": ["Drama", "Science Fiction", "Thriller"],
        "cast": ["Domhnall Gleeson", "Alicia Vikander", "Oscar Isaac"],
        "director": "Alex Garland",
        "keywords": ["ai", "robot", "consciousness", "turing test", "isolation"],
        "overview": "A programmer is selected to participate in a groundbreaking experiment in artificial intelligence.",
        "vote_average": 7.7, "tmdb_id": 264644
    },
    {
        "id": 81, "title": "Black Mirror: Bandersnatch", "year": 2018,
        "genres": ["Drama", "Science Fiction", "Thriller"],
        "cast": ["Fionn Whitehead", "Craig Parkinson", "Alice Lowe"],
        "director": "David Slade",
        "keywords": ["interactive", "1980s", "game", "reality", "choice"],
        "overview": "In 1984, a young programmer begins to question reality as he adapts a dark fantasy novel into a video game.",
        "vote_average": 7.2, "tmdb_id": 543696
    },
    {
        "id": 82, "title": "The Truman Show", "year": 1998,
        "genres": ["Comedy", "Drama"],
        "cast": ["Jim Carrey", "Laura Linney", "Noah Emmerich"],
        "director": "Peter Weir",
        "keywords": ["reality tv", "surveillance", "identity", "freedom", "deception"],
        "overview": "An insurance salesman discovers his whole life is actually a reality TV show.",
        "vote_average": 8.2, "tmdb_id": 37165
    },
    {
        "id": 83, "title": "Catch Me If You Can", "year": 2002,
        "genres": ["Biography", "Crime", "Drama"],
        "cast": ["Leonardo DiCaprio", "Tom Hanks", "Christopher Walken"],
        "director": "Steven Spielberg",
        "keywords": ["con artist", "fbi", "impersonation", "fraud", "cat and mouse"],
        "overview": "Frank Abagnale Jr. successfully performed cons as a pilot, doctor, and legal prosecutor.",
        "vote_average": 8.1, "tmdb_id": 5765
    },
    {
        "id": 84, "title": "American History X", "year": 1998,
        "genres": ["Crime", "Drama"],
        "cast": ["Edward Norton", "Edward Furlong", "Beverly D'Angelo"],
        "director": "Tony Kaye",
        "keywords": ["racism", "neo-nazi", "redemption", "brother", "reform"],
        "overview": "A former neo-nazi skinhead tries to prevent his younger brother from going down the same wrong path.",
        "vote_average": 8.5, "tmdb_id": 9691
    },
    {
        "id": 85, "title": "Good Will Hunting", "year": 1997,
        "genres": ["Drama", "Romance"],
        "cast": ["Matt Damon", "Robin Williams", "Ben Affleck"],
        "director": "Gus Van Sant",
        "keywords": ["genius", "therapy", "boston", "math", "potential"],
        "overview": "Will Hunting, a janitor at MIT, has a gift for mathematics but needs help from a therapist to find direction in his life.",
        "vote_average": 8.3, "tmdb_id": 489
    },
    {
        "id": 86, "title": "A Beautiful Mind", "year": 2001,
        "genres": ["Biography", "Drama"],
        "cast": ["Russell Crowe", "Ed Harris", "Jennifer Connelly"],
        "director": "Ron Howard",
        "keywords": ["mathematics", "schizophrenia", "nobel prize", "genius", "biography"],
        "overview": "After John Nash, a brilliant but asocial mathematician, accepts secret work in cryptography, his life takes a turn.",
        "vote_average": 8.0, "tmdb_id": 453
    },
    {
        "id": 87, "title": "Rain Man", "year": 1988,
        "genres": ["Drama", "Romance"],
        "cast": ["Dustin Hoffman", "Tom Cruise", "Valeria Golino"],
        "director": "Barry Levinson",
        "keywords": ["autism", "brothers", "road trip", "savant", "connection"],
        "overview": "When a selfish yuppie discovers that his estranged father has died and left all his money to an autistic savant brother.",
        "vote_average": 8.0, "tmdb_id": 380
    },
    {
        "id": 88, "title": "Cast Away", "year": 2000,
        "genres": ["Adventure", "Drama", "Romance"],
        "cast": ["Tom Hanks", "Helen Hunt", "Nick Searcy"],
        "director": "Robert Zemeckis",
        "keywords": ["island", "survival", "stranded", "isolation", "volleyball"],
        "overview": "A FedEx executive undergoes a spiritual transformation after surviving a plane crash and being stranded on an island.",
        "vote_average": 7.7, "tmdb_id": 935
    },
    {
        "id": 89, "title": "The Terminal", "year": 2004,
        "genres": ["Comedy", "Drama", "Romance"],
        "cast": ["Tom Hanks", "Catherine Zeta-Jones", "Stanley Tucci"],
        "director": "Steven Spielberg",
        "keywords": ["airport", "immigrant", "stranded", "love", "bureaucracy"],
        "overview": "An Eastern European tourist unexpectedly finds himself stranded in JFK airport and takes up temporary residence there.",
        "vote_average": 7.4, "tmdb_id": 8337
    },
    {
        "id": 90, "title": "The Martian", "year": 2015,
        "genres": ["Adventure", "Drama", "Science Fiction"],
        "cast": ["Matt Damon", "Jessica Chastain", "Kristen Wiig"],
        "director": "Ridley Scott",
        "keywords": ["mars", "survival", "astronaut", "science", "rescue"],
        "overview": "An astronaut becomes stranded on Mars after his team assumes him dead and must rely on his ingenuity to survive.",
        "vote_average": 8.0, "tmdb_id": 286217
    },
    {
        "id": 91, "title": "Gravity", "year": 2013,
        "genres": ["Science Fiction", "Thriller"],
        "cast": ["Sandra Bullock", "George Clooney", "Ed Harris"],
        "director": "Alfonso Cuarón",
        "keywords": ["space", "astronaut", "survival", "debris", "orbit"],
        "overview": "Two astronauts work together to survive after an accident leaves them stranded in space.",
        "vote_average": 7.7, "tmdb_id": 49047
    },
    {
        "id": 92, "title": "Children of Men", "year": 2006,
        "genres": ["Action", "Drama", "Science Fiction"],
        "cast": ["Clive Owen", "Julianne Moore", "Michael Caine"],
        "director": "Alfonso Cuarón",
        "keywords": ["dystopia", "infertility", "hope", "future", "refugee"],
        "overview": "In 2027, in a chaotic world in which humans can no longer procreate, a former activist agrees to help transport a pregnant woman.",
        "vote_average": 7.9, "tmdb_id": 9693
    },
    {
        "id": 93, "title": "Pan's Labyrinth", "year": 2006,
        "genres": ["Drama", "Fantasy", "War"],
        "cast": ["Ivana Baquero", "Sergi López", "Doug Jones"],
        "director": "Guillermo del Toro",
        "keywords": ["fairy tale", "spain", "fascism", "fantasy", "civil war"],
        "overview": "In the Falangist Spain of 1944, the bookish young stepdaughter of a sadistic army officer escapes into an eerie but captivating fantasy world.",
        "vote_average": 8.2, "tmdb_id": 1368
    },
    {
        "id": 94, "title": "The Shape of Water", "year": 2017,
        "genres": ["Drama", "Fantasy", "Romance"],
        "cast": ["Sally Hawkins", "Octavia Spencer", "Michael Shannon"],
        "director": "Guillermo del Toro",
        "keywords": ["creature", "romance", "mute", "cold war", "fantasy"],
        "overview": "At a top secret research facility in the 1960s, a lonely janitor forms a unique relationship with an amphibious creature.",
        "vote_average": 7.3, "tmdb_id": 399055
    },
    {
        "id": 95, "title": "Black Swan", "year": 2010,
        "genres": ["Drama", "Thriller"],
        "cast": ["Natalie Portman", "Mila Kunis", "Vincent Cassel"],
        "director": "Darren Aronofsky",
        "keywords": ["ballet", "obsession", "psychological", "doppelganger", "perfection"],
        "overview": "A ballet dancer wins the lead in Swan Lake and begins to seriously lose her mind in the process.",
        "vote_average": 7.9, "tmdb_id": 38308
    },
    {
        "id": 96, "title": "Requiem for a Dream", "year": 2000,
        "genres": ["Drama"],
        "cast": ["Ellen Burstyn", "Jared Leto", "Jennifer Connelly"],
        "director": "Darren Aronofsky",
        "keywords": ["addiction", "drugs", "descent", "tragedy", "television"],
        "overview": "The drug-induced utopias of four Coney Island people are shattered when their addictions run deep.",
        "vote_average": 8.3, "tmdb_id": 641
    },
    {
        "id": 97, "title": "Pi", "year": 1998,
        "genres": ["Drama", "Science Fiction", "Thriller"],
        "cast": ["Sean Gullette", "Mark Margolis", "Ben Shenkman"],
        "director": "Darren Aronofsky",
        "keywords": ["mathematics", "obsession", "paranoia", "pattern", "conspiracy"],
        "overview": "A paranoid mathematician searches for a key number that will unlock the universal patterns found in nature.",
        "vote_average": 7.4, "tmdb_id": 83
    },
    {
        "id": 98, "title": "The Sixth Sense", "year": 1999,
        "genres": ["Drama", "Mystery", "Thriller"],
        "cast": ["Bruce Willis", "Haley Joel Osment", "Toni Collette"],
        "director": "M. Night Shyamalan",
        "keywords": ["ghost", "child", "twist", "supernatural", "psychologist"],
        "overview": "A child psychologist named Malcolm Crowe begins seeing patient Cole Sear, a troubled, isolated boy who tells him a secret.",
        "vote_average": 8.2, "tmdb_id": 745
    },
    {
        "id": 99, "title": "Unbreakable", "year": 2000,
        "genres": ["Drama", "Science Fiction", "Thriller"],
        "cast": ["Bruce Willis", "Samuel L. Jackson", "Robin Wright"],
        "director": "M. Night Shyamalan",
        "keywords": ["superhero", "identity", "comic book", "thriller", "mystery"],
        "overview": "A man learns something extraordinary about himself after a devastating accident.",
        "vote_average": 7.3, "tmdb_id": 9340
    },
    {
        "id": 100, "title": "Signs", "year": 2002,
        "genres": ["Drama", "Science Fiction", "Thriller"],
        "cast": ["Mel Gibson", "Joaquin Phoenix", "Rory Culkin"],
        "director": "M. Night Shyamalan",
        "keywords": ["alien", "crop circles", "faith", "family", "invasion"],
        "overview": "A former Episcopal priest living on a farm with his family discovers a series of crop circles in his fields.",
        "vote_average": 6.7, "tmdb_id": 1649
    },
    {
        "id": 101, "title": "District 9", "year": 2009,
        "genres": ["Action", "Science Fiction", "Thriller"],
        "cast": ["Sharlto Copley", "David James", "Jason Cope"],
        "director": "Neill Blomkamp",
        "keywords": ["alien", "apartheid", "south africa", "refugee", "transformation"],
        "overview": "An extraterrestrial race forced to live in slum-like conditions on Earth finds a kindred spirit in a government agent who is exposed to their biotechnology.",
        "vote_average": 7.9, "tmdb_id": 17654
    },
    {
        "id": 102, "title": "Edge of Tomorrow", "year": 2014,
        "genres": ["Action", "Science Fiction"],
        "cast": ["Tom Cruise", "Emily Blunt", "Bill Paxton"],
        "director": "Doug Liman",
        "keywords": ["time loop", "alien", "war", "military", "groundhog day"],
        "overview": "A military officer is brought into an alien war against an extraterrestrial enemy who can reset the day.",
        "vote_average": 7.9, "tmdb_id": 137113
    },
    {
        "id": 103, "title": "Source Code", "year": 2011,
        "genres": ["Action", "Mystery", "Science Fiction"],
        "cast": ["Jake Gyllenhaal", "Michelle Monaghan", "Vera Farmiga"],
        "director": "Duncan Jones",
        "keywords": ["time loop", "train", "mystery", "parallel reality", "mission"],
        "overview": "A soldier wakes up in someone else's body and discovers he's part of an experimental government program.",
        "vote_average": 7.5, "tmdb_id": 37936
    },
    {
        "id": 104, "title": "Moon", "year": 2009,
        "genres": ["Drama", "Mystery", "Science Fiction"],
        "cast": ["Sam Rockwell", "Kevin Spacey", "Dominique McElligott"],
        "director": "Duncan Jones",
        "keywords": ["moon", "isolation", "clone", "identity", "space"],
        "overview": "Astronaut Sam Bell has a quintessentially personal encounter toward the end of his three-year stint on the Moon.",
        "vote_average": 7.9, "tmdb_id": 37168
    },
    {
        "id": 105, "title": "Annihilation", "year": 2018,
        "genres": ["Drama", "Horror", "Science Fiction"],
        "cast": ["Natalie Portman", "Jennifer Jason Leigh", "Tessa Thompson"],
        "director": "Alex Garland",
        "keywords": ["alien", "mutation", "biologist", "mystery", "zone"],
        "overview": "A biologist signs up for a dangerous, secret expedition where the laws of nature don't apply.",
        "vote_average": 7.5, "tmdb_id": 300668
    },
    {
        "id": 106, "title": "28 Days Later", "year": 2002,
        "genres": ["Drama", "Horror", "Science Fiction"],
        "cast": ["Cillian Murphy", "Naomie Harris", "Christopher Eccleston"],
        "director": "Danny Boyle",
        "keywords": ["zombie", "rage virus", "survival", "post-apocalyptic", "london"],
        "overview": "Four weeks after a mysterious virus begins to sweep the nation, a handful of survivors try to find sanctuary.",
        "vote_average": 7.6, "tmdb_id": 28
    },
    {
        "id": 107, "title": "Slumdog Millionaire", "year": 2008,
        "genres": ["Crime", "Drama", "Romance"],
        "cast": ["Dev Patel", "Freida Pinto", "Anil Kapoor"],
        "director": "Danny Boyle",
        "keywords": ["india", "poverty", "game show", "love", "destiny"],
        "overview": "A Mumbai teen is suspected of cheating on the Who Wants to Be a Millionaire show, and tells his incredible life story.",
        "vote_average": 8.0, "tmdb_id": 12405
    },
    {
        "id": 108, "title": "Trainspotting", "year": 1996,
        "genres": ["Drama"],
        "cast": ["Ewan McGregor", "Ewen Bremner", "Jonny Lee Miller"],
        "director": "Danny Boyle",
        "keywords": ["drugs", "scotland", "heroin", "friendship", "lifestyle"],
        "overview": "Renton, deeply immersed in the drug scene of Edinburgh, tries to clean up his act.",
        "vote_average": 8.1, "tmdb_id": 627
    },
    {
        "id": 109, "title": "About Time", "year": 2013,
        "genres": ["Comedy", "Drama", "Fantasy"],
        "cast": ["Domhnall Gleeson", "Rachel McAdams", "Bill Nighy"],
        "director": "Richard Curtis",
        "keywords": ["time travel", "love", "family", "romance", "british"],
        "overview": "At the age of 21, Tim discovers he can travel in time and changes the past and future of his life.",
        "vote_average": 7.8, "tmdb_id": 166424
    },
    {
        "id": 110, "title": "The Notebook", "year": 2004,
        "genres": ["Drama", "Romance"],
        "cast": ["Ryan Gosling", "Rachel McAdams", "James Garner"],
        "director": "Nick Cassavetes",
        "keywords": ["romance", "love", "memory", "summer", "class difference"],
        "overview": "A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom.",
        "vote_average": 7.9, "tmdb_id": 11036
    },
    {
        "id": 111, "title": "Before Sunrise", "year": 1995,
        "genres": ["Drama", "Romance"],
        "cast": ["Ethan Hawke", "Julie Delpy", "Andrea Eckert"],
        "director": "Richard Linklater",
        "keywords": ["romance", "europe", "one night", "conversation", "connection"],
        "overview": "A young man and woman meet on a train in Europe and agree to spend one evening together in Vienna.",
        "vote_average": 8.1, "tmdb_id": 1813
    },
    {
        "id": 112, "title": "Boyhood", "year": 2014,
        "genres": ["Drama"],
        "cast": ["Ellar Coltrane", "Patricia Arquette", "Ethan Hawke"],
        "director": "Richard Linklater",
        "keywords": ["growing up", "real time", "family", "texas", "coming of age"],
        "overview": "The life of Mason from age 6 to 18, filmed with the same cast over 12 years.",
        "vote_average": 7.9, "tmdb_id": 209112
    },
    {
        "id": 113, "title": "Little Miss Sunshine", "year": 2006,
        "genres": ["Comedy", "Drama"],
        "cast": ["Abigail Breslin", "Greg Kinnear", "Paul Dano"],
        "director": "Jonathan Dayton",
        "keywords": ["road trip", "family", "pageant", "dysfunctional", "comedy"],
        "overview": "A family loaded with quirky, colorful characters piles into a VW bus and drives across the southwestern U.S.",
        "vote_average": 7.9, "tmdb_id": 773
    },
    {
        "id": 114, "title": "Juno", "year": 2007,
        "genres": ["Comedy", "Drama"],
        "cast": ["Ellen Page", "Michael Cera", "Jennifer Garner"],
        "director": "Jason Reitman",
        "keywords": ["pregnancy", "teen", "adoption", "quirky", "indie"],
        "overview": "Faced with an unplanned pregnancy, an offbeat young woman makes an unusual decision regarding her unborn child.",
        "vote_average": 7.5, "tmdb_id": 2253
    },
    {
        "id": 115, "title": "The Breakfast Club", "year": 1985,
        "genres": ["Comedy", "Drama"],
        "cast": ["Emilio Estevez", "Ally Sheedy", "Molly Ringwald"],
        "director": "John Hughes",
        "keywords": ["detention", "high school", "friendship", "stereotypes", "80s"],
        "overview": "Five high school students from different walks of life endure a Saturday detention together and come to realize they are not so different.",
        "vote_average": 7.9, "tmdb_id": 2108
    },
    {
        "id": 116, "title": "Ferris Bueller's Day Off", "year": 1986,
        "genres": ["Comedy"],
        "cast": ["Matthew Broderick", "Alan Ruck", "Mia Sara"],
        "director": "John Hughes",
        "keywords": ["school", "skip", "chicago", "adventure", "friendship"],
        "overview": "A high school student decides to skip school for the day, but has to avoid his suspicious principal.",
        "vote_average": 7.9, "tmdb_id": 9377
    },
    {
        "id": 117, "title": "Stand By Me", "year": 1986,
        "genres": ["Adventure", "Drama"],
        "cast": ["Wil Wheaton", "River Phoenix", "Corey Feldman"],
        "director": "Rob Reiner",
        "keywords": ["friendship", "coming of age", "adventure", "childhood", "oregon"],
        "overview": "After learning a dead body is located near their small town, four friends set off on a journey to find it.",
        "vote_average": 8.1, "tmdb_id": 3081
    },
    {
        "id": 118, "title": "Superbad", "year": 2007,
        "genres": ["Comedy"],
        "cast": ["Jonah Hill", "Michael Cera", "Christopher Mintz-Plasse"],
        "director": "Greg Mottola",
        "keywords": ["high school", "party", "friendship", "coming of age", "comedy"],
        "overview": "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to provide alcohol for a party goes awry.",
        "vote_average": 7.6, "tmdb_id": 8363
    },
    {
        "id": 119, "title": "The Hangover", "year": 2009,
        "genres": ["Comedy"],
        "cast": ["Zach Galifianakis", "Bradley Cooper", "Justin Bartha"],
        "director": "Todd Phillips",
        "keywords": ["bachelor party", "las vegas", "mystery", "comedy", "memory loss"],
        "overview": "Three buddies wake up from a bachelor party in Las Vegas with no memory of the previous night and the groom missing.",
        "vote_average": 7.7, "tmdb_id": 18785
    },
    {
        "id": 120, "title": "Office Space", "year": 1999,
        "genres": ["Comedy"],
        "cast": ["Ron Livingston", "Jennifer Aniston", "Gary Cole"],
        "director": "Mike Judge",
        "keywords": ["office", "work", "satire", "corporate", "cult"],
        "overview": "Inspired by his new girlfriend, a software engineer becomes increasingly indifferent to his job.",
        "vote_average": 7.9, "tmdb_id": 1542
    },
    {
        "id": 121, "title": "Nightcrawler", "year": 2014,
        "genres": ["Crime", "Drama", "Thriller"],
        "cast": ["Jake Gyllenhaal", "Rene Russo", "Riz Ahmed"],
        "director": "Dan Gilroy",
        "keywords": ["journalism", "crime", "obsession", "los angeles", "ambition"],
        "overview": "A petty thief straddles the line between observer and participant as a crime journalist.",
        "vote_average": 7.9, "tmdb_id": 242582
    },
    {
        "id": 122, "title": "Drive", "year": 2011,
        "genres": ["Crime", "Drama", "Thriller"],
        "cast": ["Ryan Gosling", "Carey Mulligan", "Bryan Cranston"],
        "director": "Nicolas Winding Refn",
        "keywords": ["stunt driver", "crime", "neon", "violence", "getaway"],
        "overview": "A mysterious Hollywood stuntman and mechanic moonlights as a getaway driver and finds himself in trouble.",
        "vote_average": 7.8, "tmdb_id": 57158
    },
    {
        "id": 123, "title": "Only God Forgives", "year": 2013,
        "genres": ["Crime", "Drama", "Thriller"],
        "cast": ["Ryan Gosling", "Kristin Scott Thomas", "Vithaya Pansringarm"],
        "director": "Nicolas Winding Refn",
        "keywords": ["bangkok", "crime", "violence", "neon", "revenge"],
        "overview": "Julian, a drug-smuggler thriving in Bangkok's criminal underworld, sees his life get even more complicated when his mother compels him to find and kill whoever is responsible for his brother's recent death.",
        "vote_average": 5.9, "tmdb_id": 137090
    },
    {
        "id": 124, "title": "Prisoners", "year": 2013,
        "genres": ["Crime", "Drama", "Mystery"],
        "cast": ["Hugh Jackman", "Jake Gyllenhaal", "Viola Davis"],
        "director": "Denis Villeneuve",
        "keywords": ["kidnapping", "detective", "moral", "father", "mystery"],
        "overview": "A father goes to extremes to find his daughter after she goes missing.",
        "vote_average": 8.1, "tmdb_id": 146233
    },
    {
        "id": 125, "title": "Spotlight", "year": 2015,
        "genres": ["Biography", "Crime", "Drama"],
        "cast": ["Michael Keaton", "Mark Ruffalo", "Rachel McAdams"],
        "director": "Tom McCarthy",
        "keywords": ["journalism", "investigation", "scandal", "church", "boston"],
        "overview": "The true story of how the Boston Globe uncovered the massive scandal of child molestation within the local Catholic Archdiocese.",
        "vote_average": 8.1, "tmdb_id": 314365
    },
    {
        "id": 126, "title": "The Big Short", "year": 2015,
        "genres": ["Biography", "Comedy", "Drama"],
        "cast": ["Christian Bale", "Steve Carell", "Ryan Gosling"],
        "director": "Adam McKay",
        "keywords": ["finance", "housing crisis", "wall street", "banks", "prediction"],
        "overview": "In 2006-7 a group of investors bet against the US mortgage market.",
        "vote_average": 7.8, "tmdb_id": 318846
    },
    {
        "id": 127, "title": "Margin Call", "year": 2011,
        "genres": ["Drama", "Thriller"],
        "cast": ["Kevin Spacey", "Paul Bettany", "Jeremy Irons"],
        "director": "J.C. Chandor",
        "keywords": ["finance", "wall street", "risk", "crisis", "moral"],
        "overview": "Follows the key people at an investment bank over a 24-hour period during the early stages of the 2008 financial crisis.",
        "vote_average": 7.1, "tmdb_id": 83305
    },
    {
        "id": 128, "title": "There Will Be Blood", "year": 2007,
        "genres": ["Drama", "History"],
        "cast": ["Daniel Day-Lewis", "Paul Dano", "Ciarán Hinds"],
        "director": "Paul Thomas Anderson",
        "keywords": ["oil", "greed", "capitalism", "religion", "power"],
        "overview": "A story of family, religion, hatred, oil, and madness, focusing on a turn-of-the-century American oil prospector.",
        "vote_average": 8.2, "tmdb_id": 861
    },
    {
        "id": 129, "title": "Boogie Nights", "year": 1997,
        "genres": ["Crime", "Drama"],
        "cast": ["Mark Wahlberg", "Burt Reynolds", "Julianne Moore"],
        "director": "Paul Thomas Anderson",
        "keywords": ["porn", "1970s", "fame", "drugs", "rise and fall"],
        "overview": "The story of the rise and fall of a young man in the porn industry of the 1970s and 1980s.",
        "vote_average": 7.9, "tmdb_id": 10726
    },
    {
        "id": 130, "title": "Magnolia", "year": 1999,
        "genres": ["Drama"],
        "cast": ["Tom Cruise", "Julianne Moore", "Philip Seymour Hoffman"],
        "director": "Paul Thomas Anderson",
        "keywords": ["ensemble", "coincidence", "regret", "tv", "los angeles"],
        "overview": "An epic mosaic of interrelated characters in search of happiness, forgiveness, and meaning in the San Fernando Valley.",
        "vote_average": 8.0, "tmdb_id": 626
    },
    {
        "id": 131, "title": "Phantom Thread", "year": 2017,
        "genres": ["Drama", "Romance"],
        "cast": ["Daniel Day-Lewis", "Vicky Krieps", "Lesley Manville"],
        "director": "Paul Thomas Anderson",
        "keywords": ["fashion", "obsession", "1950s", "couture", "control"],
        "overview": "Set in the glamour of 1950s post-war London, Reynolds Woodcock is a renowned dressmaker whose fastidious life is disrupted by Alma.",
        "vote_average": 7.5, "tmdb_id": 459101
    },
    {
        "id": 132, "title": "Her", "year": 2013,
        "genres": ["Drama", "Romance", "Science Fiction"],
        "cast": ["Joaquin Phoenix", "Scarlett Johansson", "Amy Adams"],
        "director": "Spike Jonze",
        "keywords": ["ai", "love", "future", "technology", "loneliness"],
        "overview": "A lonely writer develops an unlikely relationship with an OS.",
        "vote_average": 8.0, "tmdb_id": 152601
    },
    {
        "id": 133, "title": "Being John Malkovich", "year": 1999,
        "genres": ["Comedy", "Drama", "Fantasy"],
        "cast": ["John Cusack", "Cameron Diaz", "John Malkovich"],
        "director": "Spike Jonze",
        "keywords": ["identity", "portal", "surreal", "celebrity", "puppeteer"],
        "overview": "A puppeteer discovers a portal that leads literally into the head of movie star John Malkovich.",
        "vote_average": 7.8, "tmdb_id": 492
    },
    {
        "id": 134, "title": "Synecdoche, New York", "year": 2008,
        "genres": ["Comedy", "Drama"],
        "cast": ["Philip Seymour Hoffman", "Samantha Morton", "Michelle Williams"],
        "director": "Charlie Kaufman",
        "keywords": ["existential", "theater", "life", "art", "mortality"],
        "overview": "A theater director struggles with his work, and the women in his life, as he attempts to create a life-size replica of New York.",
        "vote_average": 7.5, "tmdb_id": 14534
    },
    {
        "id": 135, "title": "Adaptation", "year": 2002,
        "genres": ["Comedy", "Drama"],
        "cast": ["Nicolas Cage", "Meryl Streep", "Chris Cooper"],
        "director": "Spike Jonze",
        "keywords": ["screenwriting", "meta", "orchid", "twins", "writer"],
        "overview": "A frustrated screenwriter contends with his pathetic social life while attempting to adapt the novel 'The Orchid Thief'.",
        "vote_average": 7.7, "tmdb_id": 6073
    },
    {
        "id": 136, "title": "The Lighthouse", "year": 2019,
        "genres": ["Drama", "Horror", "Mystery"],
        "cast": ["Willem Dafoe", "Robert Pattinson", "Valeriia Karaman"],
        "director": "Robert Eggers",
        "keywords": ["isolation", "madness", "sea", "lighthouse", "black and white"],
        "overview": "Two lighthouse keepers try to maintain their sanity while living on a remote and mysterious New England island.",
        "vote_average": 7.5, "tmdb_id": 503919
    },
    {
        "id": 137, "title": "The Witch", "year": 2015,
        "genres": ["Drama", "Horror", "Mystery"],
        "cast": ["Anya Taylor-Joy", "Ralph Ineson", "Kate Dickie"],
        "director": "Robert Eggers",
        "keywords": ["witch", "puritan", "1630s", "new england", "folk horror"],
        "overview": "A Puritan family encounter forces of evil in the woods beyond their New England farm.",
        "vote_average": 6.9, "tmdb_id": 301325
    },
    {
        "id": 138, "title": "Burning", "year": 2018,
        "genres": ["Drama", "Mystery", "Thriller"],
        "cast": ["Yoo Ah-in", "Steven Yeun", "Jeon Jong-seo"],
        "director": "Lee Chang-dong",
        "keywords": ["mystery", "jealousy", "korea", "disappearance", "class"],
        "overview": "Based on a Haruki Murakami short story, a young man meets a girl who asks him to look after her cat and befriends a mysterious stranger.",
        "vote_average": 7.5, "tmdb_id": 505014
    },
    {
        "id": 139, "title": "Portrait of a Lady on Fire", "year": 2019,
        "genres": ["Drama", "Romance"],
        "cast": ["Noémie Merlant", "Adèle Haenel", "Luàna Bajrami"],
        "director": "Céline Sciamma",
        "keywords": ["painting", "love", "18th century", "france", "woman"],
        "overview": "On an isolated island in Brittany at the end of the eighteenth century, a female painter is commissioned to do a wedding portrait of a young woman.",
        "vote_average": 8.1, "tmdb_id": 586361
    },
    {
        "id": 140, "title": "Moonlight", "year": 2016,
        "genres": ["Drama"],
        "cast": ["Mahershala Ali", "Naomie Harris", "Trevante Rhodes"],
        "director": "Barry Jenkins",
        "keywords": ["identity", "coming of age", "lgbt", "miami", "drugs"],
        "overview": "A young African-American man grapples with his identity and sexuality while experiencing the adversity of poverty.",
        "vote_average": 7.4, "tmdb_id": 376867
    },
    {
        "id": 141, "title": "Beasts of the Southern Wild", "year": 2012,
        "genres": ["Adventure", "Drama", "Fantasy"],
        "cast": ["Quvenzhané Wallis", "Dwight Henry", "Levy Easterly"],
        "director": "Benh Zeitlin",
        "keywords": ["bayou", "fantasy", "childhood", "survival", "louisiana"],
        "overview": "A girl in rural Louisiana is in love with her rough and wild homeland and is determined to protect it after a threatening storm.",
        "vote_average": 7.3, "tmdb_id": 92916
    },
    {
        "id": 142, "title": "Nomadland", "year": 2020,
        "genres": ["Drama"],
        "cast": ["Frances McDormand", "David Strathairn", "Linda May"],
        "director": "Chloé Zhao",
        "keywords": ["nomad", "america", "van life", "loss", "freedom"],
        "overview": "A woman in her sixties embarks on a journey through the American West after losing everything in the Great Recession.",
        "vote_average": 7.4, "tmdb_id": 522627
    },
    {
        "id": 143, "title": "Soul", "year": 2020,
        "genres": ["Animation", "Comedy", "Drama"],
        "cast": ["Jamie Foxx", "Tina Fey", "Graham Norton"],
        "director": "Pete Docter",
        "keywords": ["jazz", "life purpose", "soul", "afterlife", "pixar"],
        "overview": "A musician who has lost his passion for music is transported out of his body and must find his way back.",
        "vote_average": 8.1, "tmdb_id": 508442
    },
    {
        "id": 144, "title": "Coco", "year": 2017,
        "genres": ["Animation", "Family", "Music"],
        "cast": ["Anthony Gonzalez", "Gael García Bernal", "Benjamin Bratt"],
        "director": "Lee Unkrich",
        "keywords": ["mexico", "day of the dead", "family", "music", "memory"],
        "overview": "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead.",
        "vote_average": 8.4, "tmdb_id": 354912
    },
    {
        "id": 145, "title": "Inside Out", "year": 2015,
        "genres": ["Animation", "Comedy", "Family"],
        "cast": ["Amy Poehler", "Bill Hader", "Mindy Kaling"],
        "director": "Pete Docter",
        "keywords": ["emotions", "childhood", "imagination", "growing up", "pixar"],
        "overview": "After young Riley is uprooted from her Midwest life and moved to San Francisco, her emotions struggle to deal with her new surroundings.",
        "vote_average": 8.2, "tmdb_id": 150540
    },
    {
        "id": 146, "title": "Finding Nemo", "year": 2003,
        "genres": ["Animation", "Family"],
        "cast": ["Albert Brooks", "Ellen DeGeneres", "Alexander Gould"],
        "director": "Andrew Stanton",
        "keywords": ["ocean", "fish", "adventure", "father", "pixar"],
        "overview": "After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home.",
        "vote_average": 8.2, "tmdb_id": 12
    },
    {
        "id": 147, "title": "Shrek", "year": 2001,
        "genres": ["Animation", "Comedy", "Family"],
        "cast": ["Mike Myers", "Eddie Murphy", "Cameron Diaz"],
        "director": "Andrew Adamson",
        "keywords": ["ogre", "fairy tale", "love", "subversion", "comedy"],
        "overview": "After his swamp is filled with magical creatures, Shrek agrees to rescue Princess Fiona for Lord Farquaad.",
        "vote_average": 7.9, "tmdb_id": 809
    },
    {
        "id": 148, "title": "Kung Fu Panda", "year": 2008,
        "genres": ["Animation", "Action", "Comedy"],
        "cast": ["Jack Black", "Dustin Hoffman", "Angelina Jolie"],
        "director": "Mark Osborne",
        "keywords": ["martial arts", "panda", "destiny", "china", "kung fu"],
        "overview": "A hapless panda must find strength and learn the secrets of kung fu to save his village from a evil snow leopard.",
        "vote_average": 7.6, "tmdb_id": 9502
    },
    {
        "id": 149, "title": "How to Train Your Dragon", "year": 2010,
        "genres": ["Animation", "Adventure", "Family"],
        "cast": ["Jay Baruchel", "Gerard Butler", "America Ferrera"],
        "director": "Dean DeBlois",
        "keywords": ["dragon", "viking", "friendship", "adventure", "outcast"],
        "overview": "A Viking teenager who aspires to hunt dragons befriends a young dragon and learns about the true nature of the creatures.",
        "vote_average": 8.1, "tmdb_id": 10515
    },
    {
        "id": 150, "title": "The Incredibles", "year": 2004,
        "genres": ["Animation", "Action", "Adventure"],
        "cast": ["Craig T. Nelson", "Holly Hunter", "Samuel L. Jackson"],
        "director": "Brad Bird",
        "keywords": ["superhero", "family", "retired", "pixar", "secret identity"],
        "overview": "A family of undercover superheroes are forced out of retirement when a new villain hatches a diabolical plan.",
        "vote_average": 8.0, "tmdb_id": 9806
    }
]

TRENDING_IDS = [1, 2, 8, 10, 14, 28, 31, 37, 40, 65, 66, 76, 80, 90, 143]
TOP_RATED_IDS = [8, 10, 4, 5, 6, 14, 9, 11, 65, 7, 73, 26, 39, 27, 50]
