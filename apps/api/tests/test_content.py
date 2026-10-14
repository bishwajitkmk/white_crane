from app import client_content as copy
from app.load_client_content import load
from app.models import BoardMember, Role


def test_board_and_trainers_are_listed_separately(login):
    client = login(Role.board)
    client.post("/admin/board-members", json={"name": "Board Person", "role": "President"})
    client.post("/admin/board-members", json={"kind": "trainer", "name": "Trainer One"})
    client.post("/admin/board-members", json={"kind": "trainer", "name": "Trainer Two"})

    board = client.get("/public/board-members").json()
    trainers = client.get("/public/board-members", params={"kind": "trainer"}).json()
    assert [m["name"] for m in board] == ["Board Person"]
    assert [(m["name"], m["position"]) for m in trainers] == [("Trainer One", 1), ("Trainer Two", 2)]
    assert [m["name"] for m in client.get("/admin/board-members", params={"kind": "trainer"}).json()] == [
        "Trainer One",
        "Trainer Two",
    ]


def test_content_defaults_to_board_copy(client):
    content = client.get("/public/content").json()
    assert content["mission"] == copy.MISSION
    assert content["trainer_credentials"] == copy.TRAINER_CREDENTIALS
    assert "vision" not in content


def test_load_client_content_upserts_by_name(db, client):
    db.add_all(
        [
            BoardMember(name="Member Name", role="Role / credentials", position=0),
            BoardMember(name="Hollie Granato", role="Old role", position=1),
            BoardMember(name="Someone Else", role="Founder", position=2),
        ]
    )
    db.commit()

    for _ in range(2):  # re-running changes nothing
        load(db)
        db.commit()

    board = client.get("/public/board-members").json()
    assert [m["name"] for m in board] == [name for name, *_ in copy.BOARD] + ["Someone Else"]
    assert board[0]["role"] == "President" and board[0]["photo_url"] == "/team/hollie-granato.jpg"
    trainers = client.get("/public/board-members", params={"kind": "trainer"}).json()
    assert [m["name"] for m in trainers] == [name for name, *_ in copy.TRAINERS]
