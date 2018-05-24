import { Service } from 'typedi';
import axios from 'axios';
import { ListInterface } from '../interface/IList';
@Service('imglist')
export class ListService implements ListInterface {
  /**
   * 获取图片列表
   * @param id 用户id
   */
  async getImgList(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      axios({
        url: `/api/images/list/${id}`,
        method: 'GET'
      }).then((res) => {
        resolve(res.data);
      })
    })
  }
}