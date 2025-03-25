const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;


const { urlencoded } = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(urlencoded({ extended: true }));

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


// app.get('/api/getEquipment', (req, res) => {
//     const query = "SELECT id, rodzaj, model, ilosc FROM sprzet";
//     baza.query(query, (err, results) => {
//         if (err) {
//             console.error('Błąd zapytania:', err);
//             return res.status(500).send('Błąd serwera');
//         }
//         res.json(results);
//     });
// });

app.get('/api/getEquipment', (req, res) => {
    const { page = 1, itemsPerPage = 10 } = req.query;
    const pageNumber = parseInt(page);
    const itemsPerPageNumber = parseInt(itemsPerPage);

    if (isNaN(pageNumber) || isNaN(itemsPerPageNumber)) {
        return res.status(400).send("Błąd - argumenyt są niepoprawne!");
    }

    if (itemsPerPageNumber == -1) {
        const query = `
            SELECT przedmiot.id_przedmiotu, przedmiot.nazwa_przedmiotu, przedmiot.opis_przedmiotu, 
                   przedmiot.rodzaj_przedmiotu, przedmiot.firma_przedmiotu, 
                   CONCAT(wlasciciel.imie_wlasciciela, ' ', wlasciciel.nazwisko_wlasciciela) as daneW 
            FROM przedmiot 
            INNER JOIN wlasciciel ON przedmiot.id_wlasciciela = wlasciciel.id_wlasciciela;
        `;

        baza.query(query, (err, results) => {
            if (err) {
                console.error('Błąd zapytania:', err);
                return res.status(500).send('Błąd serwera');
            }
            res.json({ items: results, total: results.length });
        });
    } else {
        const offset = (pageNumber - 1) * itemsPerPageNumber;


        const countQuery = `SELECT COUNT(*) AS total FROM przedmiot;`;

        baza.query(countQuery, (err, countResults) => {
            if (err) {
                console.error('Błąd zapytania:', err);
                return res.status(500).send('Błąd serwera');
            }
            const totalItems = countResults[0].total;


            const query = `
                SELECT przedmiot.id_przedmiotu, przedmiot.nazwa_przedmiotu, przedmiot.opis_przedmiotu, 
                       przedmiot.rodzaj_przedmiotu, przedmiot.firma_przedmiotu, 
                       CONCAT(wlasciciel.imie_wlasciciela, ' ', wlasciciel.nazwisko_wlasciciela) as daneW 
                FROM przedmiot 
                INNER JOIN wlasciciel ON przedmiot.id_wlasciciela = wlasciciel.id_wlasciciela 
                LIMIT ? OFFSET ?;
            `;

            baza.query(query, [itemsPerPageNumber, offset], (err, results) => {
                if (err) {
                    console.error('Błąd zapytania:', err);
                    return res.status(500).send('Błąd serwera');
                }
                res.json({ items: results, total: totalItems });
            });
        });
    }
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
        // planowane pobieranie danych do formularza dodawania
        console.log('Coś tutaj będzie...');
    } else {
   
        const getEmployeesQuery = `SELECT CONCAT(imie_wlasciciela, " ", nazwisko_wlasciciela) AS daneW FROM wlasciciel`;

 
        const getOwnerAndDataQuery = `
            SELECT CONCAT(wlasciciel.imie_wlasciciela, " ", wlasciciel.nazwisko_wlasciciela) AS daneW, przedmiot.nazwa_przedmiotu, przedmiot.opis_przedmiotu, przedmiot.firma_przedmiotu
            FROM przedmiot 
            INNER JOIN wlasciciel ON przedmiot.id_wlasciciela = wlasciciel.id_wlasciciela
            WHERE przedmiot.id_przedmiotu = ?`;

    
        baza.query(getEmployeesQuery, (err, employees) => {
            if (err) {
                console.error('Błąd zapytania:', err);
                return res.status(500).send('Błąd serwera');
            }

         
            baza.query(getOwnerAndDataQuery, id, (err, data) => {
                if (err) {
                    console.error('Błąd zapytania:', err);
                    return res.status(500).send('Błąd serwera');
                }
                
           
                res.json({
                    employees: employees.map(e => e.daneW),  
                    owner: data.length > 0 ? data[0].daneW : null,
                    nazwa: data[0].nazwa_przedmiotu,
                    opis: data[0].opis_przedmiotu,
                    firma: data[0].firma_przedmiotu
                });
            });
        });
    }
});

app.post('/api/updateItem', (req, res) => {
    const { id, nprzedmiotu, opis, fprzedmiotu, pracownik } = req.body;


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

           
                const getEmployee = `SELECT id_wlasciciela FROM wlasciciel WHERE imie_wlasciciela = ? AND nazwisko_wlasciciela = ?`;
                baza.query(getEmployee, [firstName, lastName], (err, employeeResults) => {
                    if (err) {
                        console.error('Błąd zapytania przy pobieraniu pracownika:', err);
                        return res.status(500).send('Błąd serwera');
                    }
                    if (employeeResults.length > 0) {
                        const idWlasciciela = employeeResults[0].id_wlasciciela;

                        // console.log('Dane do zapytania UPDATE:', {
                        //     idWlasciciela,
                        //     nprzedmiotu,
                        //     opis,
                        //     fprzedmiotu,
                        //     id
                        // });

                        const updateQuery = `UPDATE przedmiot SET id_wlasciciela = ?, nazwa_przedmiotu = ?, opis_przedmiotu = ?, firma_przedmiotu = ? WHERE id_przedmiotu = ?`;

                        baza.query(updateQuery, [idWlasciciela, nprzedmiotu, opis, fprzedmiotu, id], (err) => {
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




app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

