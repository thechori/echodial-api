// import { Knex } from "knex";

// export async function seed(knex: Knex): Promise<void> {
//   // Delete relationships first
//   await knex("submission_review").del();
//   await knex("user_office").del();
//   await knex("submission").del();

//   // Delete primary entities
//   await knex("user").del();
//   await knex("office").del();

//   // Inserts user entries
//   const userIds = await knex("user")
//     .insert([
//       {
//         first_name: "Ryan",
//         last_name: "Teodoro",
//         email: "thechori@gmail.com",
//         password_hash: "897fg89dfg789df789g7d89fg",
//       },
//       {
//         first_name: "Sophia",
//         last_name: "Park",
//         email: "sopphiacci2000@gmail.com",
//         password_hash: "d87d67s5f67s5f76sd67fsd0f9",
//       },
//       {
//         first_name: "Johnathan",
//         last_name: "Phan",
//         email: "imjohnphan1@gmail.com",
//         password_hash: "a98s7da89s7d89sd7g87fd78g8df7",
//       },
//       {
//         first_name: "Steve",
//         last_name: "Ooo",
//         email: "steve000o0o@gmail.com",
//         password_hash: "a989s89dfg8d9g8df90g8df7",
//       },
//     ])
//     .returning("id");

//   const officeIds = await knex("office")
//     .insert([
//       {
//         name: "Space City Smiles",
//         email: "hello@spacecitysmilesdentistry.com",
//         phone: "7139293532",
//         address: "2415 Blalock Rd, Suite A, Houston, Tx 77080",
//         website: "https://www.spacecitysmilesdentistry.com/",
//       },
//       {
//         name: "Texas Dental Specialists",
//         phone: "7137900288",
//         address: "1513 W Dallas St, Houston, TX 77019",
//         website: "https://www.spacecitysmilesdentistry.com/",
//       },
//       {
//         name: "The Heights Modern Dentistry",
//         email: null,
//         phone: "7138684488",
//         address: "1911 Taylor St D, Houston, TX 77007",
//         website: "https://theheightsmoderndentistry.com",
//       },
//       {
//         name: "The Houston Dentists",
//         email: null,
//         phone: "7136687137",
//         address: "4914 Bissonnet Street, Ste 200, Bellaire, TX 77401",
//         website: "https://www.drfrazar.com/",
//       },
//       {
//         name: "The Dentists at Westchase",
//         email: "info@HoustonWestchaseDentists.com",
//         phone: "8328308226",
//         address: "1500 City West Blvd #110, Houston TX",
//         website: "https://www.houstonwestchasedentists.com/",
//       },
//       {
//         name: "Cosmetic Dentists of Houston",
//         email: null,
//         phone: "7136221977",
//         address: "1900 W Loop S Suite 1150, Houston TX 77027",
//         website: "https://www.houstondental.com/",
//       },
//     ])
//     .returning("id");

//   // extract values from objects
//   const uids = userIds.map((obj) => obj.id);
//   const oids = officeIds.map((obj) => obj.id);

//   const userOfficeIds = await knex("user_office").insert([
//     {
//       user_id: uids[0], // ryan
//       office_id: oids[1], // tds
//     },
//     {
//       user_id: uids[1], // sophia
//       office_id: oids[1], // tds
//     },
//     {
//       user_id: uids[2], // john
//       office_id: oids[0], // space city smiles
//     },
//     {
//       user_id: uids[3], // steve
//       office_id: oids[2], // heights modern dentistry
//     },
//   ]);

//   const submissionIds = await knex("submission")
//     .insert([
//       {
//         office_id: oids[0],
//         first_name: "Ricky",
//         last_name: "Bobby",
//         email: "rbobby6969@hotmail.com",
//         phone: "8323334444",
//         notes: "baseball dun mes'd up my teeth, fam. help me",
//         image_urls: [
//           "https://media.istockphoto.com/id/177419223/photo/destructed-teeth.jpg?s=612x612&w=is&k=20&c=fwphcjc5rftnhbuP69oKrp2hkWRfB1AEQF1UYofBDsE=",
//           "https://post.healthline.com/wp-content/uploads/2019/04/Crooked-bottom-teeth-1296x728-gallery_slide1.jpg",
//         ],
//       },
//       {
//         office_id: oids[0],
//         first_name: "Joe",
//         last_name: "Shmoe",
//         email: "joe.shmoe@yahoo.com",
//         phone: "3461113333",
//         notes: "CAvity. Fix it!!",
//         image_urls: [
//           "https://media.istockphoto.com/id/178533544/photo/teeth-abrasion.jpg?s=612x612&w=0&k=20&c=sLEY0cLUOyFpuTTbqjL4eJRkrkkUk4Atf5vDe2eNJKM=",
//           "https://cdn-denmk.nitrocdn.com/xXVzNEsKHjBkIyORvLtGPeGnHjNsWVfZ/assets/images/optimized/rev-4ede0e8/wp-content/uploads/2021/03/crooked-teeth-5826595_640.jpg",
//         ],
//       },
//       {
//         office_id: oids[1],
//         first_name: "Tina",
//         last_name: "Pham",
//         email: "cutipham713@gmail.com",
//         phone: "7134441212",
//         notes: "i'll give you kisses for free dental work ;) -- lmk",
//         image_urls: [
//           "https://thumbs.dreamstime.com/b/asian-woman-clean-teeth-1995401.jpg",
//           "https://st4.depositphotos.com/13193658/30160/i/1600/depositphotos_301601694-stock-photo-cropped-view-beautiful-asian-woman.jpg",
//         ],
//       },
//       {
//         office_id: oids[3],
//         first_name: "Trish",
//         last_name: "1000",
//         email: "t1khotshit@hotmail.com",
//         phone: "6966966969",
//         notes: "bithc im bad fuk off and lmk get that free cleaning",
//         image_urls: [
//           "https://img.freepik.com/premium-photo/happy-little-asian-girl-child-showing-front-teeth-with-big-smile-laughing_43963-143.jpg?w=2000",
//           "https://static.vecteezy.com/system/resources/previews/008/957/719/large_2x/asian-little-girl-smiling-with-perfect-smile-and-white-teeth-in-dental-care-photo.jpg",
//         ],
//       },
//     ])
//     .returning("id");

//   const sids = submissionIds.map((s) => s.id);

//   const submissionReviewIds = await knex("submission_review")
//     .insert([
//       {
//         submission_id: sids[0],
//         user_id: uids[2],
//         notes:
//           "Patient seems to love racing cars and looks like Will Ferrell. I love it.",
//         notes_for_patient:
//           "From what I see, one cavity and a basic cleaning would be advised. $150 for the cavity filling and $100 for the cleaning.",
//         cost_estimate: 250.0,
//       },
//       {
//         submission_id: sids[1],
//         user_id: uids[2],
//         notes:
//           "This guy seems very demanding. Might not want to take him on. Seems problematic and not worth the money.",
//         notes_for_patient:
//           "The cavity seems to be very large and will likely require a root canal. For this, we will charge $2,000.",
//         cost_estimate: 2000.0,
//       },
//       {
//         submission_id: sids[2],
//         user_id: uids[0],
//         notes: "I drift cars, so I'm going to full send this bitch.",
//         notes_for_patient:
//           "Listen here, kid. Brush your teeth more. Come in and buy me a car and I will give you life advice.",
//         cost_estimate: 19999.99,
//       },
//     ])
//     .returning("id");
// }
