  private void onFABClick() {     // on a click, we organize the ILC rooms from small to large, plus 1 "unknown" (aka rm 111)
        ArrayList<DataObject> small = new ArrayList<DataObject>();
        ArrayList<DataObject> med = new ArrayList<DataObject>();
        ArrayList<DataObject> large = new ArrayList<DataObject>();  // set up an arrayList to hold all of the rooms for each category
        ArrayList<DataObject> other = new ArrayList<DataObject>();
        ArrayList<DataObject> res = new ArrayList<DataObject>();

        for (DataObject obj : mRoomData) {
            if (Pattern.compile(Pattern.quote("small"), Pattern.CASE_INSENSITIVE).matcher(obj.getmText2()).find())  // essentially, this just means if the room description (obj.getmText2 (yay variable names :) ) contains the word "small", we add it to the list of small rooms
                small.add(obj);
            else if (Pattern.compile(Pattern.quote("medium"), Pattern.CASE_INSENSITIVE).matcher(obj.getmText2()).find())    // ditto for the other two types
                med.add(obj);
            else if (Pattern.compile(Pattern.quote("large"), Pattern.CASE_INSENSITIVE).matcher(obj.getmText2()).find())
                large.add(obj);
            else other.add(obj);    // it's not a small, medium or large room, so it *must* be rm 111 (at least until they change things)
        }


        small.get(0).setHeader("Small Group Rooms");
        med.get(0).setHeader("Medium Group Rooms");
        large.get(0).setHeader("Large Group Rooms");
        other.get(0).setHeader("Uncategorized Rooms");

        res.addAll(small);
        res.addAll(med);
        res.addAll(large);
        res.addAll(other);

        mAdapter = new SectionedRecyclerView(res);
        mRecyclerView.setAdapter(mAdapter);

    }

    private boolean onFABLongClick() {  // for this function, we grab all rooms that are currently unbooked, and display a nice list of them

        mProgressView.setVisibility(View.VISIBLE);  // show a loading screen while this is going on, it takes a good 3-5 seconds depending on your internet connection, and that's with a SD650, which is a mid-high end CPU -> ToDo: make this more efficient if possible, although since network calls take a while, and we need to use a new call for every room ,it may not be possible to make this faster

        ILCRoomObjManager roomInf = new ILCRoomObjManager(this.getContext());   // get the database table containing the list of all the ILC rooms in the database
        ArrayList<DataObject> result = new ArrayList<DataObject>();                 // create a arratList to hold the rooms that are avaliable
        ArrayList<DatabaseRow> data = roomInf.getTable();                   // get the data from the roomInfo table in the database, and put it in a arrayList

        Calendar cal = Calendar.getInstance();  // create a new calendar, and initialize it to today

        try {
            if (data != null && data.size() > 0) {  // if there exists a room in the table (there should be some, unless this is the first launch, and the table has not been populated yet)

                showProgress(true);                 // display the loading scree -> ToDo: make this actually work :P
                mProgressView.setVisibility(View.VISIBLE);   // display the loading scree -> ToDo: make this actually work :P

                for (DatabaseRow row : data) {  // for each room within the database
                    getDibsRoomInfo dibs = new getDibsRoomInfo(this.getContext());  // create a new instance of the getDibsRoomInfo class, which essentially uses the d!bs API to get a JSON with room booking data for the given room at a given date
                    ILCRoomObj room = (ILCRoomObj) row; // create a new ILC Room Object
                    roomAvaliabiliy = dibs.execute(room.getRoomId(), cal.get(Calendar.DAY_OF_MONTH), cal.get(Calendar.MONTH), cal.get(Calendar.YEAR)).get();    // get the room avaliability on the UI thread (this means it's slllloooooooowwwwwwwwww)
                    int status = getDayAvaliability();  // see if the room is free today / right now
                    if (status == 0) {                  // room is free right now for the current hour timeslot
                        result.add(new DataObject(room.getName(), "Is Avaliable Now", room.getRoomId(), true, "", room.getDescription()));

                    } else if (status == 2) // if the room was booked for the current time slot, but the slot is almost over (sHour == now - 1 && nowMin < 30)
                        result.add(new DataObject(room.getName(), "Is Avaliable at " + cal.get(Calendar.HOUR) + ":30", room.getRoomId(), true, "", room.getDescription()));

                    else if (status == 4)   // if the room was booked for the current timeslot, but it is still before the timeslot starts (sHour == now && nowMin < 30)
                        result.add(new DataObject(room.getName(), "Is Avaliable Until " + cal.get(Calendar.HOUR) + ":30", room.getRoomId(), true, "", room.getDescription()));

                    else if (status == 3)   // if the room is booked for the next time slot (sHour == now + 1)
                        result.add(new DataObject(room.getName(), "Is Avaliable Until " + (cal.get(Calendar.HOUR) + 1) + ":30", room.getRoomId(), true, "", room.getDescription()));
                }
            }

        } catch (InterruptedException e) {
            e.printStackTrace();
            return false;
        } catch (ExecutionException e) {
            e.printStackTrace();
            return false;
        }


        showProgress(false);

        mAdapter = new SectionedRecyclerView(result);
        mRecyclerView.setAdapter(mAdapter);

        return true;
    }

    public ArrayList<DataObject> getDayEventData() {
//        TextView noClassMessage = (TextView) mView.findViewById(R.id.no_class_message);
//        noClassMessage.setVisibility(View.GONE); //updates day view when go to new day - may have class
        ILCRoomObjManager roomInf = new ILCRoomObjManager(this.getContext());

        ArrayList<DataObject> result = new ArrayList<DataObject>();

        ArrayList<DatabaseRow> data = roomInf.getTable();

        if (data != null && data.size() > 0) {
            for (DatabaseRow row : data) {
                ILCRoomObj room = (ILCRoomObj) row;
                boolean hasTV = room.getDescription().contains("TV") || room.getDescription().contains("Projector") ? true : false;
                result.add(new DataObject(room.getName(), room.getDescription(), room.getRoomId(), hasTV, "")); // create a new DataObject with the inputed parameters to be shown within the recyclerView
            }
            mRoomData = result;
            return result;
        }
        return null;
    }

    public int getDayAvaliability() {   // gets the information sent to it, and returns whether or not the room is free at the current timeslot


        if (roomAvaliabiliy != null && roomAvaliabiliy.length() > 0) {  // if the JSON array containing the data is not null (which would be bad)
            try {
                JSONArray arr = new JSONArray(roomAvaliabiliy); // make a JSON array variable to hold a properly formatted JSON object

                int state = 0;

                Calendar cal = Calendar.getInstance();      // get a new calendar set to the current time
                int now = cal.get(Calendar.HOUR_OF_DAY);    // get the current hour in 24 hour format (it's a lot easier like this)
                int nowMin = cal.get(Calendar.MINUTE);      // get the current minute, for checking on the half hour purposes (because aligning everything to a hour start would have been too easy)

                for (int i = 0; i < arr.length(); i++) {    // for all of the data within the array
                    JSONObject roomInfo = arr.getJSONObject(i); // get the info for the JSON object (each booking is it's own object)
                    String start = roomInfo.getString("StartTime"); // get the startTime and endTime contained within the object
                    String end = roomInfo.getString("EndTime");

                    start = start.substring(start.indexOf("T") + 1);    // get the posistion of the start and end times, and set the string to be the useful part
                    end = end.substring(end.indexOf("T") + 1);

                    int sHour = Integer.parseInt(start.substring(0, 2));    // cast the starting hour to an int
                    int eHour = Integer.parseInt(start.substring(0, 2));    // cast the ending hour to an int
//                    if (sHour == now && nowMin < 30)            // if the room was booked for the current timeslot, but it is still before the timeslot starts
//                        return 4;
                    if (sHour == now || (sHour <= now && now <= eHour)) {   // if the current hour is equal to the start hour of a booking, or the current hour is within the time of a booking
                        return 1;       // return 1, the room is currently booked, so we are done, return immediately.
                    } else if (sHour == now - 1 && nowMin < 30) // if the room was booked for the current time slot, but the slot is almost over
                        state = 2;  // keep state as 2, so that people know that the room is free for the next hour block.  If return 1 is never called, 2 will be returned
                    else if (sHour == now + 1)                  // if the room is booked for the next time slot
                        state = 3;  // let users know that the room will be booked in the next slot, so that they know someone will be after them
                }
                return state;   // if the room is not currently booked, return the state of the room booking as explained above
            } catch (JSONException e) { // something broke :(
                
            }
        }
        return 0;
    }
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// the following function displays the data for an individual room, showing all the times the room is free during a given day, from the current time until the ILC closes.		 //
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	public ArrayList<DataObject> getDayAvaliability() {

        ArrayList<DataObject> result = new ArrayList<DataObject>();
        ArrayList<DataObject> list = new ArrayList<DataObject>();
        Calendar cal = Calendar.getInstance();
        int hour = cal.get(Calendar.HOUR_OF_DAY);

        for (int i = cal.get(Calendar.HOUR_OF_DAY) - 1; i < 23; i++) {
            result.add(new DataObject("From: " + (i)+":" + 30,"To: " + (i + 1)+":" + 30));
        }

        if (roomAvaliabiliy != null && roomAvaliabiliy.length() > 0) {
            try {
                JSONArray arr = new JSONArray(roomAvaliabiliy);

                for (int i = 0; i < arr.length(); i++) {
                    JSONObject roomInfo = arr.getJSONObject(i);
                    String start = roomInfo.getString("StartTime");
                    String end = roomInfo.getString("EndTime");

                    start = start.substring(start.indexOf("T") + 1);
                    end = end.substring(end.indexOf("T") + 1);

                    DataObject currentTime = new DataObject("From: " + start, "To: " + end);

                    list.add(currentTime);

                    for (int j = 0; j < result.size(); j++) {
                            DataObject temp = result.get(j);
                        String test = result.get(j).getmText1().substring(6);
                        int startTime = Integer.parseInt(test.substring(0,test.indexOf(":")));
//                        int tempend = Integer.parseInt(result.get(j).getmText2().substring(0,result.get(j).getmText1().indexOf(":")));

                        if (Integer.parseInt(start.substring(0,2)) == startTime){
                            result.remove(j);
                            if (j > 0)
                                j --;
                        }
                        else if (Integer.parseInt(start.substring(0,2)) < startTime && Integer.parseInt(end.substring(0,2)) > startTime ){
                            result.remove(j);
                            if (j > 0)
                                j --;
                        }
                    }
//                    if (result.contains(currentTime)){
//                        result.remove(currentTime);
//                    }

//                    list.add(new DataObject("From: " + start, "To: " + end));
                }

                for (int j = 0; j < result.size(); j++) {
                    String test = result.get(j).getmText1().substring(6);
                    int temptime = Integer.parseInt(test.substring(0,test.indexOf(":")));

                    if (temptime >= 12) {
                        result.get(j).setmText1("From: " + (temptime - 12) + ":30 PM");
                        test = result.get(j).getmText2().substring(4);
                        int endtime = Integer.parseInt(test.substring(0,test.indexOf(":")));
                        result.get(j).setmText2("To: " + (endtime - 12) + ":30 PM");
                    }
                    else if (temptime == 11)
                    {
                        test = result.get(j).getmText2().substring(4);
                        int endtime = Integer.parseInt(test.substring(0,test.indexOf(":")));
                        result.get(j).setmText2("To: " + (endtime - 12) + ":30 PM");
                    }
                    else
                    {
                        result.get(j).setmText1("From: " + (temptime) + ":30 AM");
                        test = result.get(j).getmText2().substring(4);
                        int endtime = Integer.parseInt(test.substring(0,test.indexOf(":")));
                        result.get(j).setmText2("To: " + (endtime) + ":30 AM");
                    }
                }
                return result;
            } catch (JSONException e) {

            }
        }
        return null;
    }