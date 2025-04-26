const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// potrzebne do swaggera
const swaggerUi = require("swagger-ui-express");
const YAML = require('yamljs')
const swaggerDocument = YAML.load("./swagger.yaml");



const { urlencoded } = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(urlencoded({ extended: true }));

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.get('/items', (req, res) => {
    res.json(baza);
});


const tables = ['kategorie', 'przedmiot', 'właściciel'];

// koniec swaggera


const baza = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test4'
});

baza.connect(err => {
    if (err) {
        console.log('Błąd połączenia:', err);
        return;
    }
    console.log("Połączono z bazą");
});


app.get('/api/getEquipment', (req, res) => {
    const {
        page = '1',
        itemsPerPage = '10',
        employee = '-1',
        sortBy = 'nazwasprzetu',
        sortDesc = 'asc',
        filter = null
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const itemsPerPageNumber = parseInt(itemsPerPage, 10);
    const employeeNumber = parseInt(employee, 10);
    const sortKey = sortBy || "nazwasprzetu";
    const sortDirection = (sortDesc === 'true' || sortDesc === true) ? "DESC" : "ASC";
    const columnFilters = {
        nazwasprzetu: req.query.nazwasprzetu || '',
        owner: req.query.owner || '',
        opis: req.query.opis || '',
        firma: req.query.firma || '',
        rodzaj: req.query.rodzaj || ''
    };

    const sortableColumns = {
        nazwasprzetu: "przedmiot.nazwa_przedmiotu",
        owner: "daneW",
        firma: "przedmiot.firma_przedmiotu",
        rodzaj: "kategorie.nazwa",
    };
    const sortColumn = sortableColumns[sortKey] || "przedmiot.nazwa_przedmiotu";

    if (isNaN(pageNumber) || isNaN(itemsPerPageNumber) || isNaN(employeeNumber)) {
        return res.status(400).send('Błąd - niepoprawne argumenty!');
    }

    let baseWhere = 'WHERE 1=1';
    const queryParams = [];


    if (filter === 'przypisane') {
        baseWhere += ' AND przedmiot.id_wlasciciela != 1';
    } else if (filter === 'wolne') {
        baseWhere += ' AND przedmiot.id_wlasciciela =  1';
    }

    if (employeeNumber !== -1) {
        baseWhere += ' AND przedmiot.id_wlasciciela = ?';
        queryParams.push(employeeNumber);
    }
    if (columnFilters.nazwasprzetu) {
        baseWhere += ' AND przedmiot.nazwa_przedmiotu LIKE ?';
        queryParams.push(`%${columnFilters.nazwasprzetu}%`);
    }
    if (columnFilters.owner) {
        baseWhere += ` AND CONCAT(wlasciciel.imie_wlasciciela, ' ', wlasciciel.nazwisko_wlasciciela) LIKE ?`;
        queryParams.push(`%${columnFilters.owner}%`);
    }
    if (columnFilters.opis) {
        baseWhere += ' AND przedmiot.opis_przedmiotu LIKE ?';
        queryParams.push(`%${columnFilters.opis}%`);
    }
    if (columnFilters.firma) {
        baseWhere += ' AND przedmiot.firma_przedmiotu LIKE ?';
        queryParams.push(`%${columnFilters.firma}%`);
    }
    if (columnFilters.rodzaj) {
        baseWhere += ' AND kategorie.nazwa LIKE ?';
        queryParams.push(`%${columnFilters.rodzaj}%`);
    }



    let query = `
        SELECT przedmiot.id_przedmiotu, przedmiot.nazwa_przedmiotu, przedmiot.opis_przedmiotu, 
               przedmiot.firma_przedmiotu, przedmiot.status,
               CONCAT(wlasciciel.imie_wlasciciela, ' ', wlasciciel.nazwisko_wlasciciela) AS daneW, 
               kategorie.nazwa AS rodzaj_przedmiotu
        FROM przedmiot 
        LEFT JOIN wlasciciel ON przedmiot.id_wlasciciela = wlasciciel.id_wlasciciela 
        INNER JOIN kategorie ON przedmiot.id_kategorii = kategorie.id
        ${baseWhere}
        ORDER BY ${sortColumn} ${sortDirection}
    `;

    if (itemsPerPageNumber !== -1) {
        const offset = (pageNumber - 1) * itemsPerPageNumber;
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(itemsPerPageNumber, offset);
    }

    baza.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Błąd podczas pobierania danych:', err);
            return res.status(500).send('Wewnętrzny błąd serwera');
        }

        const countQuery = `
            SELECT COUNT(*) AS total 
            FROM przedmiot 
            LEFT JOIN wlasciciel ON przedmiot.id_wlasciciela = wlasciciel.id_wlasciciela 
            INNER JOIN kategorie ON przedmiot.id_kategorii = kategorie.id
            ${baseWhere}
        `;

        const countParams = itemsPerPageNumber !== -1
            ? queryParams.slice(0, -2)
            : [...queryParams];

        baza.query(countQuery, countParams, (countErr, countResults) => {
            if (countErr) {
                console.error('Błąd podczas pobierania całkowitej liczby rekordów:', countErr);
                return res.status(500).send('Wewnętrzny błąd serwera');
            }

            const totalItems = countResults[0].total;
            res.json({
                items: results,
                total: totalItems,
                currentPage: pageNumber,
                totalPages: itemsPerPageNumber !== -1 ? Math.ceil(totalItems / itemsPerPageNumber) : 1,
            });
        });
    });
});



app.post('/api/removeItem', (req, res) => {
    const { id } = req.query;
    if (isNaN(id) || id < 0) {
        return res.status(500).send("Błąd usuwania!")
    } else {
        const check = `SELECT COUNT(id_przedmiotu) AS "check" FROM przedmiot WHERE id_przedmiotu = ?`;
        baza.query(check, id, (err, results) => {
            if (results.length > 0) {
                const deleteQuery = `DELETE FROM przedmiot WHERE id_przedmiotu = ?`;
                baza.query(deleteQuery, id, (err) => {
                    if (err) {
                        console.error('Błąd zapytania:', err);
                        return res.status(500).send('Błąd serwera');
                    } else {
                        res.status(201).send('Usunięto rekord')
                    }
                });
            }
        });

    }
});
// Pobieranie pracownika, oraz danych do formularza
app.get('/api/getwarehousFormData', (req, res) => {
    const { id } = req.query;
    if (id == -1) {
        const getEmployeesQuery = `SELECT CONCAT(imie_wlasciciela, " ", nazwisko_wlasciciela) AS daneW FROM wlasciciel`;

        const getCategoriesQuery = `SELECT nazwa FROM kategorie`;
        baza.query(getEmployeesQuery, (err, employees) => {
            if (err) {
                console.error('Błąd zapytania:', err);
                return res.status(500).send('Błąd serwera');
            }


            baza.query(getCategoriesQuery, (err, categories) => {
                if (err) {
                    console.error('Błąd zapytania:', err);
                    return res.status(500).send('Błąd serwera');
                } else {
                    res.json({
                        employees: employees.map(e => e.daneW),
                        kategorie: categories.map(c => c.nazwa)
                    });
                }
            });
        });

    } else {
        const check = `SELECT id_przedmiotu FROM przedmiot WHERE id_przedmiotu = ?`;
        baza.query(check, id, (err, results) => {
            if (err) {
                console.error('Błąd zapytania:', err);
                return res.status(500).send('Błąd serwera');
            }
            if (results.length === 0) {
                return res.status(404).send("Rekord nie istnieje");
            }

            const getEmployeesQuery = `SELECT CONCAT(imie_wlasciciela, " ", nazwisko_wlasciciela) AS daneW FROM wlasciciel`;

            const getCategoriesQuery = `SELECT nazwa FROM kategorie`;

            const getOwnerAndDataQuery = `
                SELECT CONCAT(wlasciciel.imie_wlasciciela, " ", wlasciciel.nazwisko_wlasciciela) AS daneW, 
                    przedmiot.nazwa_przedmiotu, przedmiot.opis_przedmiotu, przedmiot.firma_przedmiotu, kategorie.nazwa, przedmiot.status
                FROM przedmiot 
                INNER JOIN wlasciciel ON przedmiot.id_wlasciciela = wlasciciel.id_wlasciciela INNER JOIN kategorie ON przedmiot.id_kategorii = kategorie.id
                WHERE przedmiot.id_przedmiotu = ?`;



            baza.query(getEmployeesQuery, (err, employees) => {
                if (err) {
                    console.error('Błąd zapytania:', err);
                    return res.status(500).send('Błąd serwera');
                }


                baza.query(getCategoriesQuery, (err, categories) => {
                    if (err) {
                        console.error('Błąd zapytania:', err);
                        return res.status(500).send('Błąd serwera');
                    }

                    baza.query(getOwnerAndDataQuery, id, (err, data) => {
                        if (err) {
                            console.error('Błąd zapytania:', err);
                            return res.status(500).send('Błąd serwera');
                        }
                        // console.log(categories)
                        // console.log(employees)
                        // console.log(data[0].id_kategorii)
                        // console.log(data[0].nazwa)
                        // console.log(data[0].status)
                        res.json({
                            employees: employees.map(e => e.daneW),
                            kategorie: categories.map(c => c.nazwa),
                            zaznaczonaKategoria: data.length > 0 ? data[0].nazwa : null,
                            owner: data.length > 0 ? data[0].daneW : null,
                            nazwa: data[0].nazwa_przedmiotu,
                            opis: data[0].opis_przedmiotu,
                            firma: data[0].firma_przedmiotu,
                            status: data[0].status == 0 ? 'nieaktywne' : 'aktywne'
                        });
                    });
                });
            });
        });

    }
});

app.post('/api/updateItem', (req, res) => {
    const { id, nprzedmiotu, opis, fprzedmiotu, pracownik, wybranaKategoria, wybranyStatus } = req.body;
    // console.log(wybranaKategoria)

    const status = wybranyStatus === "nieaktywne" ? 0 : 1;

    if (isNaN(id) || id < 0) {
        return res.status(500).send("Błąd updatu!");
    } else {
        const check = `SELECT COUNT(id_przedmiotu) AS "check" FROM przedmiot WHERE id_przedmiotu = ?`;
        baza.query(check, id, (err, results) => {
            if (err) {
                console.error('Błąd zapytania:', err);
                return res.status(500).send('Błąd serwera');
            }
            if (results[0].check > 0) {
                const [firstName, lastName] = pracownik.split(' ', 2);


                const getEmployee = `SELECT id_wlasciciela, (SELECT id FROM kategorie WHERE nazwa = ?) as kat FROM wlasciciel WHERE imie_wlasciciela = ? AND nazwisko_wlasciciela = ?`;
                baza.query(getEmployee, [wybranaKategoria, firstName, lastName], (err, employeeResults) => {
                    if (err) {
                        console.error('Błąd zapytania przy pobieraniu pracownika:', err);
                        return res.status(500).send('Błąd serwera');
                    }
                    if (employeeResults.length > 0) {
                        const idWlasciciela = employeeResults[0].id_wlasciciela;
                        const idKategorii = employeeResults[0].kat;
                        // console.log(idKategorii)
                        // console.log('Dane do zapytania UPDATE:', {
                        //     idWlasciciela,
                        //     nprzedmiotu,
                        //     opis,
                        //     fprzedmiotu,
                        //     id
                        // });

                        const updateQuery = `UPDATE przedmiot SET id_wlasciciela = ?, id_kategorii = ?, nazwa_przedmiotu = ?, opis_przedmiotu = ?, firma_przedmiotu = ?, status = ? WHERE id_przedmiotu = ?`;

                        baza.query(updateQuery, [idWlasciciela, idKategorii, nprzedmiotu, opis, fprzedmiotu, status, id], (err) => {
                            if (err) {
                                console.error('Błąd zapytania UPDATE:', err);
                                return res.status(500).send('Błąd serwera');
                            } else {
                                res.status(201).send('Zaktualizowano rekord');
                            }
                        });
                    } else {
                        res.status(404).send('Nie znaleziono pracownika');
                    }
                });
            } else {
                res.status(404).send('Nie znaleziono przedmiotu');
            }
        });
    }
});


app.post('/api/addItem', (req, res) => {
    const { id, nprzedmiotu, opis, fprzedmiotu, pracownik, wybranaKategoria, wybranyStatus } = req.body;

    const status = wybranyStatus === "nieaktywne" ? 0 : 1;

    if (isNaN(id) || id != -1) {
        return res.status(500).send("Błąd dodawania!");
    } else {
        const [firstName, lastName] = pracownik.split(' ', 2);
        const getEmployee = `SELECT id_wlasciciela, (SELECT id FROM kategorie WHERE nazwa = ?) as kat FROM wlasciciel WHERE imie_wlasciciela = ? AND nazwisko_wlasciciela = ?`;
        baza.query(getEmployee, [wybranaKategoria, firstName, lastName], (err, employeeResults) => {
            if (err) {
                console.error('Błąd zapytania przy pobieraniu pracownika:', err);
                return res.status(500).send('Błąd serwera');
            }
            if (employeeResults.length > 0) {
                const idWlasciciela = employeeResults[0].id_wlasciciela;
                const idKategorii = employeeResults[0].kat;

                const insertQuery = `INSERT INTO przedmiot  VALUES(NULL, ?, ?, ?, ?, ?, NULL, ?)`;

                baza.query(insertQuery, [idWlasciciela, idKategorii, nprzedmiotu, opis, fprzedmiotu, status], (err) => {
                    if (err) {
                        console.error('Błąd zapytania INSERT:', err);
                        return res.status(500).send('Błąd serwera');
                    } else {
                        res.status(201).send('Dodano rekord');
                    }
                });
            } else {
                res.status(404).send("Nie znaleziono pracownika lub kategorii");
            }
        });
    }
});


app.get('/api/getStatistics', (req, res) => {
    const query = "SELECT COUNT(*) as 'all', (SELECT COUNT(*) FROM przedmiot WHERE id_wlasciciela != 1) as 'przypisane', (SELECT COUNT(*) FROM wlasciciel) as 'pracownicy' FROM przedmiot";
    baza.query(query, (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).send('Błąd serwera');
        } else {
            // console.log(results[0].pracownicy)
            res.json({
                all: results[0].all,
                przypisane: results[0].przypisane,
                pracownicy: results[0].pracownicy,
            });
        }
    });
});

app.get('/api/getCategories', (req, res) => {
    const query = "SELECT * FROM kategorie";
    baza.query(query, (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).send('Błąd serwera');
        } else {
            const categories = results.map(row => ({
                id: row.id,
                name: row.nazwa
            }));
            res.json(categories)
        }
    });
});

app.post('/api/addCategory', (req, res) => {
    const { nazwa } = req.body;
    const query = "INSERT INTO kategorie VALUES(NULL,?)";
    baza.query(query, nazwa, (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).send('Błąd serwera');
        } else {
            res.status(201).send("Pomyślnie dodano kategorie!")
        }
    });
});

app.post('/api/dropCategory', (req, res) => {
    const { id } = req.body;
    if (isNaN(id) || id < 0) {
        return res.status(500).send("Błąd usuwania!")
    } else {
        const check = `SELECT id_przedmiotu FROM przedmiot WHERE id_kategorii = ?`;
        baza.query(check, id, (err, results) => {
            if (err) {
                console.error('Błąd zapytania:', err);
                return res.status(500).send('Błąd serwera');
            }
            if (results.length != 0) {
                const updateDeletedCategory = "UPDATE przedmiot SET id_kategorii = 1 WHERE id_kategorii = ?";
                baza.query(updateDeletedCategory, id, (err, results) => {
                    if (err) {
                        console.error('Błąd zapytania:', err);
                        return res.status(500).send('Błąd serwera');
                    }
                });
            }
            const query = "DELETE FROM kategorie WHERE id = ?";
            baza.query(query, id, (err, results) => {
                if (err) {
                    console.error('Błąd zapytania:', err);
                    return res.status(500).send('Błąd serwera');
                } else {
                    res.status(201).send("Pomyślnie usunięto kategorie!")
                }
            });
        });
    }
});


app.get('/api/getEmployeess', (req, res) => {
    const query = "SELECT id_wlasciciela, CONCAT(imie_wlasciciela, ' ', nazwisko_wlasciciela) as daneW FROM wlasciciel";
    baza.query(query, (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).send('Błąd serwera');
        } else {
            const employees = results.map(row => ({
                id: row.id_wlasciciela,
                name: row.daneW
            }));
            res.json(employees)
        }
    });
});

app.post('/api/removeEmployee', (req, res) => {
    const { id } = req.query;
    if (isNaN(id) || id < 0) {
        return res.status(500).send("Błąd usuwania!")
    } else {
        const check = `SELECT COUNT(id_wlasciciela) AS "check" FROM wlasciciel WHERE id_wlasciciela = ?`;
        baza.query(check, id, (err, results) => {
            if (err) {
                console.error('Błąd zapytania:', err);
                return res.status(500).send('Błąd serwera');
            }
            if (results.length != 0) {
                const updateDeletedCategory = "UPDATE przedmiot SET id_wlasciciela = 1 WHERE id_wlasciciela = ?";
                baza.query(updateDeletedCategory, id, (err, results) => {
                    if (err) {
                        console.error('Błąd zapytania:', err);
                        return res.status(500).send('Błąd serwera');
                    }
                });
            }
            const query = "DELETE FROM wlasciciel WHERE id_wlasciciela = ?";
            baza.query(query, id, (err, results) => {
                if (err) {
                    console.error('Błąd zapytania:', err);
                    return res.status(500).send('Błąd serwera');
                } else {
                    res.status(201).send("Pomyślnie usunięto pracownika!")
                }
            });
        });

    }
});

app.post('/api/addEmployee', (req, res) => {
    const { imie, nazwisko } = req.body;
    const query = "INSERT INTO wlasciciel VALUES(NULL,?,?)";
    baza.query(query, [imie, nazwisko], (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).send('Błąd serwera');
        } else {
            res.status(201).send("Pomyślnie dodano pracownika!")
        }
    });
});

app.get('/api/getBarcode', (req, res) => {
    const { id } = req.query;
    const query = "SELECT kod_przedmiotu FROM przedmiot WHERE id_przedmiotu = ?";
    baza.query(query, id, (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).send('Błąd serwera');
        } else {
            res.json(results)
        }
    });
});


app.post('/api/addBarcode', (req, res) => {
    const { id, code } = req.body;
    if (!id || !code) {
        return res.status(400).json({ error: "Brak wymaganych danych" });
    }
    // console.log(id, code)
    const query = "UPDATE przedmiot SET kod_przedmiotu = ? WHERE id_przedmiotu = ?";
    baza.query(query, [code, id], (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).json({ error: 'Błąd serwera', details: err });
        } else {
            res.status(200).send("Pomyślnie zapisano kod kreskowy!");
        }
    });
});

app.get('/api/getBarcodes', (req, res) => {
    const query = "SELECT kod_przedmiotu FROM przedmiot";
    baza.query(query, (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).send('Błąd serwera');
        } else {
            const filteredResults = results.filter(result => result.kod_przedmiotu !== null);
            res.json(filteredResults)
        }
    });
});

app.post('/api/getBarcodeId', (req, res) => {
    const { code } = req.body;


    const query = "SELECT id_przedmiotu FROM przedmiot WHERE kod_przedmiotu = ?";
    baza.query(query, [code], (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).send('Błąd serwera');
        } else {
            res.json(results);
        }
    });
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

