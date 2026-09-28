import { expose } from "comlink";
import "../audio/core-cdn";
import { audioApi } from "./api-audio";

expose(audioApi);
