declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
  }

  export class Lunar {
    getYearInGanZhi(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getDayNaYin(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayTianShenType(): string;
    getDayChongDesc(): string;
    getDaySha(): string;
  }
}
