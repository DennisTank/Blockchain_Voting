import { useState } from "react/cjs/react.development";

import axios from "axios";
import Layout from "../../components/Layout";
import url from "../../url";

export default function NewVoting() {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState({ start: "", end: "" });
  //options
  const [opts, setOpts] = useState([
    { imgUrl: "", description: "" },
    { imgUrl: "", description: "" },
  ]);
  // emails
  const [ptps, setPtps] = useState([]);
  const [ps, setPs] = useState("");

  const buildFS = () => {
    const fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");
    return fileSelector;
  };
  const handleFileSelect = async (e, index) => {
    const fs = buildFS();
    e.preventDefault();
    fs.click();
    fs.onchange = async (e1) => {
      const formdata = new FormData();
      formdata.append("option", e1.target.files[0]);

      const response = await axios.post(`${url}/image`, formdata);
      const sub_url = response.data.url;

      const o = [...opts];
      o[index].imgUrl = sub_url;
      setOpts(o);
    };
  };

  const Upload = async () => {
    const response = await axios.post(`${url}/voting/new`, {
      title: title,
      startTime: time.start,
      endTime: time.end,
      emails: ptps,
      options: opts,
    });
    if (response.data.success) {
      alert("Voting added");
      window.close();
    }
  };

  const OptCard = (index) => {
    return (
      <div key={index} className=" w-full flex items-center py-1">
        <textarea
          className="w-3/6 h-20 font text-xl outline-none border-b-2 border-blue-400"
          placeholder="description"
          value={opts[index].description}
          onChange={(e) => {
            const v = e.target.value;
            const o = [...opts];
            o[index].description = v;
            setOpts(o);
          }}
        />
        <div
          className="w-20 h-20 mx-2 bg-slate-300 cursor-pointer"
          onClick={(e) => handleFileSelect(e, index)}
        >
          {opts[index].imgUrl === "" ? (
            "Add Image"
          ) : (
            <img
              src={`${url}${opts[index].imgUrl}`}
              alt=""
              className=" w-full h-full object-fill"
            />
          )}
        </div>
        {opts.length > 2 ? (
          <button
            className=" p-2 bg-red-400 rounded-md text-white font-bold cursor-pointer"
            onClick={() => {
              const o = [...opts];
              o.splice(index, 1);
              setOpts(o);
            }}
          >
            X
          </button>
        ) : (
          <></>
        )}
      </div>
    );
  };
  const Options = () => {
    return (
      <div className="w-2/4 py-2 ">
        <div className="font-bold">Options:</div>
        {opts.map((v, i) => {
          return OptCard(i);
        })}
        <button
          className="p-2 bg-blue-400  rounded-md m-2 text-white"
          onClick={() => {
            const i = [...opts];
            i.push({ imgUrl: "", description: "" });
            setOpts(i);
          }}
        >
          Add Option
        </button>
      </div>
    );
  };
  const mailCard = (index) => {
    return (
      <div
        key={index}
        className="m-1 p-1 rounded-md text-white bg-blue-400 flex justify-between"
      >
        {ptps[index]}
        <div
          className="text-white bg-red-400 rounded-md px-2 py-1 font-bold cursor-pointer"
          onClick={() => {
            let list = [...ptps];
            list.splice(index, 1);
            setPtps(list);
          }}
        >
          X
        </div>
      </div>
    );
  };
  const Participants = () => {
    return (
      <div className="w-2/4 my-2 flex flex-col font-bold">
        <div>Voters:</div>
        <div className="w-full grid grid-cols-2 grid-flow-row auto-rows-auto">
          {ptps.map((v, i) => {
            return mailCard(i);
          })}
        </div>
        <input
          className="w-full h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
          type="text"
          placeholder="eg: abc@xyz.com, def@pqr.com,..."
          onChange={(e) => {
            let value = e.target.value;
            setPs(value);
          }}
          onBlur={(e) => {
            e.target.value = "";
          }}
        />
        <button
          className=" max-w-fit p-2 bg-blue-400  rounded-md m-2 text-white"
          onClick={(e) => {
            let list = ps.replaceAll(" ", "");
            list = list.split(",");
            list = [...ptps, ...list];
            setPtps(
              list.filter((v) => {
                if (v !== "") return v;
              })
            );
          }}
        >
          Add Voters
        </button>
      </div>
    );
  };

  return (
    <Layout title={"New"}>
      <div className=" w-screen min-h-screen mx-2 py-4 bg-slate-200 flex items-center justify-center ">
        <div className="w-4/5 h-fit py-4 rounded-md bg-white shadow-lg flex flex-col items-center  justify-center">
          <div className="w-2/4 mb-6 text-2xl text-blue-400 text-center font-bold">
            Create a Voting
          </div>
          <input
            className="w-2/4 h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => {
              let o = e.target.value;
              setTitle(o);
            }}
          />
          <div className="w-1/2 font-bold flex items-center">
            Start&nbsp;&nbsp;
            <input
              className="w-auto h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
              type="datetime-local"
              value={time.start}
              onChange={(e) => {
                const v = e.target.value;
                const d = new Date(v);
                if (d.getTime() < Date.now()) {
                  alert("Pick a Future time.");
                  return;
                }
                const o = { ...time };
                o.start = v;
                setTime(o);
              }}
            />
          </div>
          <div className="w-1/2 font-bold flex items-center">
            End&nbsp;&nbsp;
            <input
              className="w-auto h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
              type="datetime-local"
              value={time.end}
              onChange={(e) => {
                if (time.start === "") return;
                const v = e.target.value;
                const en = new Date(v);
                const st = new Date(time.start);
                if (st.getTime() > en.getTime()) {
                  alert("Pick a Future time.");
                  return;
                }
                const o = { ...time };
                o.end = v;
                setTime(o);
              }}
            />
          </div>

          {Participants()}
          {Options()}
          <div className="w-2/4 flex justify-end">
            <button
              className="p-2 bg-blue-400 rounded-md m-2 text-white"
              onClick={Upload}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
