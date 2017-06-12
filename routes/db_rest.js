// routes/index.js

module.exports = function(app, Book, User ,mement)
{
	//index
	app.get('/', function(req,res){
		res.redirect('/api/books');
	});

	app.get('/login', function(req,res){
		var sess = req.session;
		res.render('login', {
			title: "NODE EXPRESS TEST",
			length: 5,
			user_id: sess.user_id,
			name: sess.name
		});
	});

	app.post('/login', function(req,res){
		User.find({u_id : req.body.user_id,password : req.body.password},  function(err, books){

			if(books.length > 0){
				var sess = req.session;

				books.forEach(function(item){
					sess.user_id = item.u_id;
					sess.name = item.name;
					res.redirect('/api/books');
				});

			}else{
				res.send('<script type="text/javascript">alert("회원정보가 없습니다.");location="/login";</script>');
				return;
			}
		});
	});

	app.get('/logout', function(req, res){
		var sess = req.session;
		if(sess.user_id){
			req.session.destroy(function(err){
				if(err){
					console.log(err);
				}else{
					res.redirect('/');
				}
			})
		}else{
			res.redirect('/');
		}
	});

	app.get('/join', function(req,res){
		var sess = req.session;
		res.render('join', {
			title: "NODE EXPRESS TEST",
			length: 5,
			user_id: sess.user_id,
			name: sess.name
		});
	});

	app.post('/join', function(req,res){
		var sess = req.session;
		res.render('join', {
			title: "NODE EXPRESS TEST",
			length: 5,
			user_id: sess.user_id,
			name: sess.name
		});
	});


	// GET ALL BOOKS
	app.get('/api/books', function(req,res){
		var sess = req.session;
		Book.find(function(err, book){
			if(err) return res.status(500).send({error: 'database failure'});
//			res.json(book);
			res.render('list', {
				user_id: sess.user_id,
				title: "책 리스트",
				book: book,
				err:err,
				mement
			});
		});
	});

	// CREATE BOOK
	app.post('/api/books', function(req, res){
		var sess = req.session;
		if(!sess.user_id){
			res.send('<script type="text/javascript">alert("로그인이 필요한 메뉴입니다.");location="/";</script>');
			return;
		}

		var book = new Book();
		book.title = req.body.title;
		book.author = req.body.author;
		book.published_date = new Date(req.body.published_date);

		book.save(function(err){
			if(err){
				Book.find(function(err2, book){
					if(err2) return res.status(500).send({error: 'database failure'});
		//			res.json(book);
					res.render('list', {
						title: "책 리스트",
						book: book,
						err:err
					});
				});

			}else{
				res.redirect('/api/books');
			}
		});
	});

	// GET SINGLE BOOK
	app.get('/api/books/:book_id', function(req, res){
		var sess = req.session;
		Book.findOne({_id: req.params.book_id}, function(err, book){
			if(err) return res.status(500).json({error: err});
			if(!book) return res.status(404).json({error: 'book not found'});
//			res.json(book);
			res.render('view', {
				user_id: sess.user_id,
				mode:"find_book_id",
				title: "책 상세보기",
				book: book,
				err:err,
				mement
			});
		});
	});

	// GET BOOK BY AUTHOR
	app.get('/api/books/author/:author', function(req, res){
		var sess = req.session;
		Book.find({author: req.params.author}, function(err, book){
			if(err) return res.status(500).json({error: err});
			if(book.length === 0) return res.status(404).json({error: 'book not found'});
//			res.json(books);
			res.render('view', {
				user_id: sess.user_id,
				mode:"find_author",
				title: "저자 검색 ("+book[0].author+") ",
				book: book,
				err:err,
				mement
			});
		});
	});


//웹으로는 put을 요청 할 수 없기때문에 hidden 을 post로 받아서 put으로 넘겨준다.
	app.post('/api/mode', function(req, res){
		//웹으로는 put을 요청 할 수 없기때문에 hidden 을 post로 받아서 put으로 넘겨준다.
		if(req.body.mode == "put"){
			Book.findById(req.body.book_id, function(err, book){

				if(err) return res.status(500).json({ error: 'database failure' });
				if(!book) return res.status(404).json({ error: 'book not found' });

				if(req.body.title) book.title = req.body.title;
				if(req.body.author) book.author = req.body.author;
				if(req.body.published_date) book.published_date = req.body.published_date;

				book.save(function(err){
					if(err) res.status(500).json({error: 'failed to update'});
					res.redirect('/api/books');
				});
			});
		}else if(req.body.mode == "delete"){
		//웹으로는 delete를 요청 할 수 없기때문에 hidden 을 post로 받아서 delete으로 넘겨준다.
			Book.remove({ _id: req.body.book_id }, function(err, output){
				if(err) return res.status(500).json({ error: "database failure" });
				res.redirect('/api/books');
			});
		}
	});

	// UPDATE THE BOOK
	app.put('/api/books/:book_id', function(req, res){
		Book.findById(req.params.book_id, function(err, book){
//			if(err) return res.status(500).json({ error: 'database failure' });
//			if(!book) return res.status(404).json({ error: 'book not found' });

			if(req.body.title) book.title = req.body.title;
			if(req.body.author) book.author = req.body.author;
			if(req.body.published_date) book.published_date = req.body.published_date;

			book.save(function(err){
				if(err) res.status(500).json({error: 'failed to update'});
				res.json({message: 'book updated'});
			});
		});
	});

	// DELETE BOOK
	app.delete('/api/books/:book_id', function(req, res){
		Book.remove({ _id: req.params.book_id }, function(err, output){
			if(err) return res.status(500).json({ error: "database failure" });

			/* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
			if(!output.result.n) return res.status(404).json({ error: "book not found" });
			res.json({ message: "book deleted" });
			*/

			res.status(204).end();
		})
	});

}